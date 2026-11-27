import { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  TrendingUp,
  ShieldAlert,
  Trophy,
  Bot,
  KeyRound,
} from 'lucide-react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { usePageTitle } from '../../hooks/usePageTitle';
import { db } from '../../services/firebase';
import { getStudents } from '../../services/students';
import { getAllGrades } from '../../services/grades';
import { getCaptchaQueue } from '../../services/captcha';
import { calculateStudentRating } from '../../utils/rating';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  stagger = '',
}) {
  return (
    <Card hover className={`p-5 ${stagger}`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>
        <span className="text-lg opacity-60">❄️</span>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
        {value}
      </h3>
      <p className="text-sm text-slate-600 mt-1 font-semibold">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
});

export default function Dashboard() {
  usePageTitle('Dashboard', '❄️');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [captchas, setCaptchas] = useState([]);
  const [topFive, setTopFive] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getStudents(),
      getAllGrades(),
      getCaptchaQueue(),
      getDocs(collection(db, 'student_quests')),
      getDocs(collection(db, 'quiz_results')),
      getDocs(
        query(collection(db, 'admin_audit_log'), orderBy('timestamp', 'desc'), limit(5))
      ),
    ])
      .then((results) => {
        if (!active) return;

        const s = results[0].status === 'fulfilled' ? results[0].value : [];
        const g = results[1].status === 'fulfilled' ? results[1].value : [];
        const c = results[2].status === 'fulfilled' ? results[2].value : [];
        const qDocs = results[3].status === 'fulfilled' ? results[3].value.docs : [];
        const zDocs = results[4].status === 'fulfilled' ? results[4].value.docs : [];
        const aDocs = results[5].status === 'fulfilled' ? results[5].value.docs : [];

        setStudents(s);
        setGrades(g);
        setCaptchas(c);
        setAuditLogs(aDocs.map((d) => ({ id: d.id, ...d.data() })));

        const questMap = {};
        qDocs.forEach((d) => {
          questMap[d.id] = d.data();
        });

        const quizMap = {};
        zDocs.forEach((d) => {
          const best = d.data().bestByTopic || {};
          quizMap[d.id] = Object.values(best).reduce(
            (acc, v) => acc + (Number(v?.points) || 0),
            0
          );
        });

        const ranked = s
          .map((st) => ({
            ...st,
            ...calculateStudentRating(st.id, g, questMap, quizMap),
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, 5);
        setTopFive(ranked);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loader label="❄️ Ma'lumotlar yuklanmoqda..." />;
  }

  const dailyGrades = grades.filter((g) => {
    const t = (g.markType || '').toUpperCase();
    return !t.includes('BSB') && !t.includes('CHSB') && g.score !== null && !g.isPercent;
  });

  const dailyAvg = dailyGrades.length
    ? (dailyGrades.reduce((a, g) => a + g.score, 0) / dailyGrades.length).toFixed(2)
    : '—';

  const bsbCount = grades.filter((g) =>
    (g.markType || '').toUpperCase().includes('BSB')
  ).length;
  const chsbCount = grades.filter((g) =>
    (g.markType || '').toUpperCase().includes('CHSB')
  ).length;
  const studentBotOk = students.filter((s) => s.tgId && !s.botBlocked).length;
  const parentBotOk = students.filter((s) => s.parentTgId && !s.parentBotBlocked).length;

  return (
    <div className="space-y-6">
      {/* Qishki Aurora Banner */}
      <div className="winter-aurora rounded-2xl p-6 text-white shadow-xl shadow-sky-500/20 anim-stagger-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur mb-2">
              ❄️ Qishki mavsum · 9-A sinf
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Boshqaruv paneli
            </h1>
            <p className="text-sky-100 text-sm mt-1">
              {new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/students"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-semibold transition"
            >
              👥 O'quvchilar
            </Link>
            <Link
              to="/rating"
              className="px-4 py-2 rounded-xl bg-white text-sky-700 hover:bg-sky-50 text-sm font-bold shadow transition"
            >
              🏆 Reyting (💰 Pul mukofoti)
            </Link>
          </div>
        </div>
      </div>

      {/* 4 ta StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="O'quvchilar"
          value={students.length}
          sub={`🤖 ${studentBotOk} o'quvchi · 👪 ${parentBotOk} ota-ona`}
          gradient="from-sky-500 to-blue-600"
          stagger="anim-stagger-1"
        />
        <StatCard
          icon={ClipboardList}
          label="Jami baholar"
          value={grades.length}
          sub={`Kunlik: ${dailyGrades.length} · BSB: ${bsbCount} · CHSB: ${chsbCount}`}
          gradient="from-cyan-500 to-indigo-600"
          stagger="anim-stagger-2"
        />
        <StatCard
          icon={TrendingUp}
          label="Kunlik o'rtacha"
          value={dailyAvg}
          sub="1-10 ballik tizim"
          gradient="from-emerald-500 to-teal-600"
          stagger="anim-stagger-3"
        />
        <StatCard
          icon={ShieldAlert}
          label="Captcha navbati"
          value={captchas.length}
          sub={captchas.length ? "Ko'rib chiqish kerak" : 'Hammasi joyida ✅'}
          gradient="from-amber-500 to-orange-600"
          stagger="anim-stagger-4"
        />
      </div>

      {/* Podium + Bot va Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 anim-stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              Top-5 Kompleks reyting
            </h2>
            <Link
              to="/rating"
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Barchasi →
            </Link>
          </div>

          {topFive.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Ma'lumot yo'q
            </p>
          ) : (
            <div className="space-y-2.5">
              {topFive.map((s, idx) => (
                <Link
                  key={s.id}
                  to={`/students/${s.id}`}
                  className="flex items-center justify-between p-3 bg-sky-50/70 hover:bg-sky-100/80 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {s.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Kunlik {s.dailyPoints} · BSB {s.bsbPoints} · CHSB {s.chsbPoints} · Topshiriq {s.questPoints} · Test {s.quizPoints}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-blue-700 shrink-0 ml-2">
                    {s.totalPoints} ball
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6 anim-stagger-4">
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bot size={18} className="text-sky-600" />
              Botga ulanish va Baholar
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "O'quvchilar botda faol",
                  value: `${studentBotOk}/${students.length}`,
                  color: 'from-emerald-400 to-teal-600',
                  percent: students.length ? (studentBotOk / students.length) * 100 : 0,
                },
                {
                  label: 'Ota-onalar botda faol',
                  value: `${parentBotOk}/${students.length}`,
                  color: 'from-sky-400 to-blue-600',
                  percent: students.length ? (parentBotOk / students.length) * 100 : 0,
                },
                {
                  label: 'Kunlik baholar',
                  value: dailyGrades.length,
                  color: 'from-indigo-400 to-violet-600',
                  percent: grades.length ? (dailyGrades.length / grades.length) * 100 : 0,
                },
                {
                  label: 'BSB / CHSB nazorat ishlari',
                  value: bsbCount + chsbCount,
                  color: 'from-amber-400 to-orange-600',
                  percent: grades.length
                    ? ((bsbCount + chsbCount) / grades.length) * 100
                    : 0,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
              <KeyRound size={16} className="text-amber-600" />
              So'nggi favqulodda parol ko'rishlari
            </h2>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400">Hozircha murojaatlar yo'q</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((a) => (
                  <div
                    key={a.id}
                    className="text-xs bg-amber-50/70 border border-amber-100 rounded-lg p-2.5"
                  >
                    <div className="flex justify-between font-semibold text-amber-900">
                      <span>{a.adminEmail || 'Admin'}</span>
                      <span>
                        {a.timestamp?.toDate?.().toLocaleString('uz-UZ') || '—'}
                      </span>
                    </div>
                    <p className="text-amber-800 mt-0.5">Sabab: {a.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
