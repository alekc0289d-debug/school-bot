import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getStudents() {
  const q = query(collection(db, 'students'), orderBy('fullName', 'asc'));
  const s = await getDocs(q);
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStudent(id) {
  if (!id) throw new Error('ID kerak');
  const d = await getDoc(doc(db, 'students', id));
  if (!d.exists()) throw new Error('Topilmadi');
  return { id: d.id, ...d.data() };
}

export async function addStudent(data) {
  const ref = await addDoc(collection(db, 'students'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStudent(id, data) {
  await updateDoc(doc(db, 'students', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return true;
}

/**
 * O'quvchini o'chirish — BARCHA bog'liq ma'lumotlar o'chiriladi.
 * Firestore batch limiti 500 ta, shuning uchun 400 tadan bo'lib o'chiriladi.
 * Student hujjati OXIRIDA o'chiriladi: yarim yo'lda xato bo'lsa, qayta
 * urinib ko'rish mumkin.
 */
export async function deleteStudent(id) {
  if (!id) throw new Error('ID kerak');

  const refs = [];
  for (const name of ['grades', 'subjects', 'schedule']) {
    const snap = await getDocs(
      query(collection(db, name), where('studentId', '==', id))
    );
    snap.docs.forEach((d) => refs.push(d.ref));
  }
  refs.push(
    doc(db, 'emaktab_creds', id),
    doc(db, 'emaktab_queue', id),
    doc(db, 'emaktab_captcha_queue', id)
  );

  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }

  await deleteDoc(doc(db, 'students', id));
  return true;
}

export async function getStudentsByClass(classId) {
  const q = query(
    collection(db, 'students'),
    where('classId', '==', classId),
    orderBy('fullName', 'asc')
  );
  const s = await getDocs(q);
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}