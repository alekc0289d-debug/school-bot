import { useEffect, useState } from 'react';
import { Trophy, Coins } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { usePageTitle } from '../../hooks/usePageTitle';
import { db } from '../../services/firebase';
import { getStudents } from '../../services/students';
import { getAllGrades } from '../../services/grades';
import { calculateStudentRating } from '../../utils/rating';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

export default function Rating() {
  usePageTitle('Reyting', '🏆');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getStudents(),
      getAllGrades(),
      getDocs(collection(db, 'student_quests')),
      getDocs(collection(db, 'quiz_results')),
    ])
      .then((results) => {
        const students = results[0].status === 'fulfilled' ? results[0].value : [];
        const grades = results[1].status === 'fulfilled' ? results[1].value : [];
        const questDocs = results[2].status === 'fulfilled' ? results[2].value.docs : [];
        const quizDocs = results[3].status === 'fulfilled' ? results[3].value.docs : [];

        const questMap = {};
        questDocs.forEach((d) => {
          questMap[d.id] = d.data();
        });

        const quizMap = {};
        quizDocs.forEach((d) => {
          const bestByTopic = d.data().bestByTopic || {};
          quizMap[d.id] = Object.values(bestByTopic).reduce(
            (acc, item) => acc + (Number(item?.points) || 0),
            0
          );
        });

        const list = students.map((s) => ({
          ...s,
          ...calculateStudentRating(s.id, grades, questMap, quizMap),
        }));

        list.sort(
          (a, b) =>
            b.totalPoints - a.totalPoints ||
            b.dailyAvg - a.dailyAvg ||
            (a.fullName || '').localeCompare(b.fullName || '')
        );
        setRanking(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-500 animate-float-slow" size={30} />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Sinf reytingi (Kompleks)
            </h1>
            <p className="text-xs text-slate-500">
              Kunlik baholar + BSB + CHSB + Topshiriqlar + Testlar
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Coins size={16} className="text-amber-600" />
          Oy g'olibiga: Pul mukofoti 💰
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && ranking.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ranking.slice(0, 3).map((s, idx) => (
            <Card
              key={s.id}
              hover
              className={`p-5 text-center anim-stagger-${idx + 1}`}
            >
              <div className="text-4xl mb-2">{medals[idx]}</div>
              <h3 className="font-bold text-slate-800 truncate">{s.fullName}</h3>
              <p className="text-2xl font-extrabold text-sky-600 mt-1">
                {s.totalPoints} ball
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Kunlik: {s.dailyPoints} · BSB: {s.bsbPoints} · CHSB: {s.chsbPoints} · Topshiriq: {s.questPoints} · Test: {s.quizPoints}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-50/80 border-b border-sky-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    O'quvchi
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase">
                    Kunlik
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase">
                    BSB
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase">
                    CHSB
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase">
                    Topshiriq
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase">
                    Test
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    Jami ball
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranking.map((s, i) => (
                  <tr key={s.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3 px-4 text-lg w-10">
                      {medals[i] || (
                        <span className="text-sm font-semibold text-slate-500">
                          {i + 1}.
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {s.fullName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.classId} · o'rtacha {s.dailyAvg} ({s.dailyCount} baho)
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-sky-700 font-medium">
                      {s.dailyPoints}
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-orange-600 font-medium">
                      {s.bsbPoints}
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-red-600 font-medium">
                      {s.chsbPoints}
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-emerald-600 font-medium">
                      {s.questPoints}
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-purple-600 font-medium">
                      {s.quizPoints}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-base font-extrabold text-blue-700">
                        {s.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
