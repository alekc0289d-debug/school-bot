import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const DAYS_ORDER = [
  'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba', 'Yakshanba',
];

export async function getScheduleByStudent(studentId) {
  const q = query(
    collection(db, 'schedule'),
    where('studentId', '==', studentId)
  );
  const s = await getDocs(q);
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ia = DAYS_ORDER.indexOf(a.dayOfWeek);
      const ib = DAYS_ORDER.indexOf(b.dayOfWeek);
      if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return (a.lessonNumber || 0) - (b.lessonNumber || 0);
    });
}

export { DAYS_ORDER };