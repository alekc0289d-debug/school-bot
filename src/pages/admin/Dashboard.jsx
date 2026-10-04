import { useEffect, useState, memo } from 'react';
import {
  Users, ClipboardList, TrendingUp, ShieldAlert,
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getStudents } from '../../services/students';
import { getAllGrades } from '../../services/grades';
import { getCaptchaQueue } from '../../services/captcha';
import Card from '../../components/ui/Card';

const StatCard = memo(function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
        {value}
      </h3>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
});

export default function Dashboard() {
  usePageTitle('Dashboard', '📊');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [captchas, setCaptchas] = useState([]);

  useEffect(() => {
    // PARALLEL — tezlik uchun
    Promise.all([
      getStudents(),
      getAllGrades(),
      getCaptchaQueue(),
    ])
      .then(([s, g, c]) => {
        setStudents(s);
        setGrades(g);
        setCaptchas(c);
      })
      .catch(console.error);
  }, []);

  const dailyGrades = grades.filter((g) => {
    const t = (g.markType || '').toUpperCase();
    return !t.includes('BSB') && !t.includes('CHSB')
      && g.score !== null && !g.isPercent;
  });

  const dailyAvg = dailyGrades.length
    ? (dailyGrades.reduce((a, g) => a + g.score, 0) / dailyGrades.length).toFixed(2)
    : '—';

  const bsbCount = grades.filter((g) =>
    (g.markType || '').toUpperCase().includes('BSB')).length;
  const chsbCount = grades.filter((g) =>
    (g.markType || '').toUpperCase().includes('CHSB')).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Bugun, {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="O'quvchilar"
          value={students.length}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Baholar"
          value={grades.length}
          sub={`Kunlik: ${dailyGrades.length} · BSB: ${bsbCount} · CHSB: ${chsbCount}`}
          gradient="from-purple-500 to-indigo-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Kunlik o'rtacha"
          value={dailyAvg}
          sub="1-10 ball"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={ShieldAlert}
          label="Captcha kutayotgan"
          value={captchas.length}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            👥 O'quvchilar
          </h2>
          {students.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Ma'lumot yo'q
            </p>
          ) : (
            <div className="space-y-2">
              {students.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {s.fullName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {s.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{s.classId}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {s.gradesCount || 0} baho
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            📊 Baholar taqsimoti
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Kunlik', value: dailyGrades.length, color: 'from-blue-500 to-blue-600', percent: grades.length ? (dailyGrades.length / grades.length * 100) : 0 },
              { label: 'BSB', value: bsbCount, color: 'from-orange-500 to-orange-600', percent: grades.length ? (bsbCount / grades.length * 100) : 0 },
              { label: 'CHSB', value: chsbCount, color: 'from-red-500 to-red-600', percent: grades.length ? (chsbCount / grades.length * 100) : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}