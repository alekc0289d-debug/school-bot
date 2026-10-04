import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function getAllGrades() {
  const q = query(collection(db, 'grades'), where('source', '==', 'emaktab'));
  const s = await getDocs(q);
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function getGradesByStudent(studentId) {
  const q = query(
    collection(db, 'grades'),
    where('studentId', '==', studentId),
    where('source', '==', 'emaktab')
  );
  const s = await getDocs(q);
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}