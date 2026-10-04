import {
  collection, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const ACTIVE = ['pending', 'answered', 'failed'];

export async function getCaptchaQueue() {
  // orderBy ishlatilmaydi — composite index talab qilmasligi uchun,
  // saralash brauzerda
  const q = query(
    collection(db, 'emaktab_captcha_queue'),
    where('status', 'in', ACTIVE)
  );
  const s = await getDocs(q);
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
}

export async function submitCaptchaAnswer(id, answer) {
  const value = (answer || '').trim();
  if (!value) throw new Error('Javob bo\'sh');
  await updateDoc(doc(db, 'emaktab_captcha_queue', id), {
    answer: value,
    status: 'answered',
    updatedAt: serverTimestamp(),
  });
}

export async function dismissCaptcha(id) {
  await deleteDoc(doc(db, 'emaktab_captcha_queue', id));
}
