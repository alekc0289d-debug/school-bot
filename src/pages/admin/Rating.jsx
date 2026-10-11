import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getStudents } from '../../services/students';
import { getAllGrades } from '../../services/grades';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

// Oddiy kunlik baho (10 ballik) — o'rtacha va reytingga FAQAT shular kiradi.
// Foizli natijalar ("38/50" -> 76) va BSB/CHSB nazorat ishlari boshqa
// shkalada, shuning uchun ularni oddiy baholar bilan qo'shib o'rtacha
// olib bo'lmaydi (avval bu sahifa aynan shuni qilib, 32.45 kabi
// ma'nosiz sonlar chiqarardi). Dashboard va O'quvchi sahifasi ham xuddi
// shu qoidadan foydalanadi.
function isDailyMark(g) {
  const s = g?.score;
  if (typeof s !== 'number' || Number.isNaN(s)) return false;
  if (g.isPercent || s > 10) return false;
  const t = (g.markType || '').toUpperCase();
  return !t.includes('BSB') && !t.includes('CHSB');
}

export default function Rating() {
  usePageTitle('Reyting');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getAllGrades()])
      .then(([students, grades]) => {
        const list = students.map((s) => {
          const sGrades = grades.filter(
            (g) => g.studentId === s.id && isDailyMark(g)
          );
          const avg = sGrades.length
            ? sGrades.reduce((a, g) => a + g.score, 0) / sGrades.length
            : 0;
          return {
            ...s,
            avg: Math.round(avg * 100) / 100,
            marksCount: sGrades.length,
          };
        });
        // Teng o'rtachada ko'proq bahosi borlar yuqorida (barqaror tartib)
        list.sort(
          (a, b) =>
            b.avg - a.avg ||
            b.marksCount - a.marksCount ||
            (a.fullName || '').localeCompare(b.fullName || '')
        );
        setRanking(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="text-amber-500" size={28} />
        <h1 className="text-2xl font-bold text-slate-800">Sinf reytingi</h1>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <div className="divide-y divide-slate-100">
            {ranking.map((s, i) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8">
                    {medals[i] || `${i + 1}.`}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {s.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.classId} · {s.marksCount} ta baho
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {s.avg}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}