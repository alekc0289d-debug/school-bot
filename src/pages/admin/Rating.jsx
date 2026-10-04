import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getStudents } from '../../services/students';
import { getAllGrades } from '../../services/grades';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

export default function Rating() {
  usePageTitle('Reyting');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getAllGrades()])
      .then(([students, grades]) => {
        const list = students.map((s) => {
          const sGrades = grades.filter(
            (g) => g.studentId === s.id && g.score !== null
          );
          const avg = sGrades.length
            ? sGrades.reduce((a, g) => a + g.score, 0) / sGrades.length
            : 0;
          return { ...s, avg: Math.round(avg * 100) / 100 };
        });
        list.sort((a, b) => b.avg - a.avg);
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
                    <p className="text-xs text-slate-500">{s.classId}</p>
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