import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export async function getSubjectsByStudent(studentId) {
  const q = query(
    collection(db, 'subjects'),
    where('studentId', '==', studentId),
    orderBy('name', 'asc')
  );
  const s = await getDocs(q);
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}