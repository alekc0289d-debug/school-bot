import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  ShieldAlert,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { auth, db } from '../../services/firebase';
import { getStudent } from '../../services/students';
import { getGradesByStudent } from '../../services/grades';
import { formatDate } from '../../utils/date';
import {
  formatUzPhoneDisplay,
  detectGenderFromLastName,
} from '../../utils/uzbekValidation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const DAYS_ORDER = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
  'Yakshanba',
];

function getTypeInfo(markType) {
  const t = (markType || '').toUpperCase();
  if (t.includes('BSB')) {
    return { label: 'BSB', bg: 'bg-orange-100', text: 'text-orange-700' };
  }
  if (t.includes('CHSB')) {
    return { label: 'CHSB', bg: 'bg-red-100', text: 'text-red-700' };
  }
  return { label: t || 'Kunlik', bg: 'bg-sky-100', text: 'text-sky-700' };
}

function scoreDisplay(g) {
  if (g.score === null || g.score === undefined) {
    return { text: g.rawValue || '—', color: 'text-slate-400' };
  }
  if (g.isPercent && g.maxValue) {
    return {
      text: `${g.rawValue}/${g.maxValue}`,
      extra: `${g.score}%`,
      color:
        g.score >= 85
          ? 'text-emerald-600'
          : g.score >= 70
          ? 'text-blue-600'
          : g.score >= 55
          ? 'text-yellow-600'
          : 'text-red-600',
    };
  }
  return {
    text: g.score,
    extra: '/10',
    color:
      g.score >= 9
        ? 'text-emerald-600'
        : g.score >= 7
        ? 'text-blue-600'
        : g.score >= 5
        ? 'text-yellow-600'
        : 'text-red-600',
  };
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [questData, setQuestData] = useState(null);
  const [quizPoints, setQuizPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');

  const [credModalOpen, setCredModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [fetchingCreds, setFetchingCreds] = useState(false);
  const [creds, setCreds] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  usePageTitle(student?.fullName || "O'quvchi");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getStudent(id),
      getGradesByStudent(id),
      getDoc(doc(db, 'student_quests', id)),
      getDoc(doc(db, 'quiz_results', id)),
    ])
      .then(([sRes, gRes, qRes, zRes]) => {
        if (!mounted) return;
        if (sRes.status === 'fulfilled' && sRes.value) {
          setStudent(sRes.value);
        } else {
          setError("O'quvchi topilmadi");
        }
        setGrades(gRes.status === 'fulfilled' ? gRes.value : []);

        if (qRes.status === 'fulfilled' && qRes.value.exists()) {
          setQuestData(qRes.value.data());
        }
        if (zRes.status === 'fulfilled' && zRes.value.exists()) {
          const best = zRes.value.data().bestByTopic || {};
          const sum = Object.values(best).reduce(
            (acc, v) => acc + (Number(v?.points) || 0),
            0
          );
          setQuizPoints(Math.round(sum * 10) / 10);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!creds) return;
    setSecondsLeft(60);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCreds(null);
          setShowPass(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [creds]);

  const handleRequestCreds = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      toast.error('Kamida 5 ta belgidan iborat sabab kiriting');
      return;
    }
    setFetchingCreds(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sessiya topilmadi, qayta kiring');

      const res = await fetch(`${API_URL}/api/admin/student-creds/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Olib bo'lmadi");

      setCreds(data);
      setShowPass(false);
      setReason('');
      toast.success("Audit logga muhrlandi (60 soniya ko'rinadi)");
    } catch (err) {
      toast.error(err.message || 'Xatolik');
    } finally {
      setFetchingCreds(false);
    }
  };

  const copyText = async (txt, label) => {
    try {
      await navigator.clipboard.writeText(txt);
      toast.success(`${label} nusxalandi`);
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  if (loading) return <Loader />;

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-slate-800">
            {error || 'Topilmadi'}
          </h2>
        </Card>
      </div>
    );
  }

  const gender =
    student.gender ||
    detectGenderFromLastName(
      student.lastName || student.fullName?.split(' ').slice(1).join(' ')
    );

  let filtered = grades;
  if (filter !== 'all') {
    const t = filter.toUpperCase();
    filtered = filtered.filter((g) => {
      const mt = (g.markType || '').toUpperCase();
      if (filter === 'daily') return !mt.includes('BSB') && !mt.includes('CHSB');
      return mt.includes(t);
    });
  }
  if (dayFilter !== 'all') {
    filtered = filtered.filter((g) => g.dayOfWeek === dayFilter);
  }

  const dailyGrades = grades.filter((g) => {
    const t = (g.markType || '').toUpperCase();
    return (
      !t.includes('BSB') &&
      !t.includes('CHSB') &&
      g.score !== null &&
      !g.isPercent
    );
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

  const grouped = {};
  filtered.forEach((g) => {
    const day = g.dayOfWeek || 'Boshqa';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(g);
  });

  const dayKeys = Object.keys(grouped).sort((a, b) => {
    const ia = DAYS_ORDER.indexOf(a);
    const ib = DAYS_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>

        <Button
          variant="secondary"
          onClick={() => setCredModalOpen(true)}
          className="!border-amber-300 !bg-amber-50 !text-amber-800 hover:!bg-amber-100"
        >
          <KeyRound size={15} className="mr-1.5" />
          Favqulodda eMaktab parolini ko'rish
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow ${
              gender === 'female'
                ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                : 'bg-gradient-to-br from-sky-500 to-indigo-600'
            }`}
          >
            {student.fullName?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-[220px]">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              <span>{student.fullName}</span>
              {gender === 'female' && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700">
                  👧 Qiz bola
                </span>
              )}
              {gender === 'male' && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
                  👦 O'g'il bola
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500">{student.classId}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-400">Telefon</p>
                <p className="text-sm font-medium">
                  {formatUzPhoneDisplay(student.phone)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Ona telefoni</p>
                <p className="text-sm font-medium">
                  {formatUzPhoneDisplay(student.motherPhone)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Ota telefoni</p>
                <p className="text-sm font-medium">
                  {formatUzPhoneDisplay(student.fatherPhone)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fanlar / Baholar</p>
                <p className="text-sm font-medium">
                  {student.subjectsCount || '—'} / {grades.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Kunlik</p>
          <p className="text-xl font-bold text-sky-600">{dailyGrades.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">BSB</p>
          <p className="text-xl font-bold text-orange-600">{bsbCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">CHSB</p>
          <p className="text-xl font-bold text-red-600">{chsbCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Kunlik o'rtacha</p>
          <p className="text-xl font-bold text-emerald-600">{dailyAvg}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Topshiriq balli</p>
          <p className="text-xl font-bold text-teal-600">
            {questData?.totalPoints || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Test balli</p>
          <p className="text-xl font-bold text-purple-600">{quizPoints}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Barcha tur' },
          { key: 'daily', label: 'Kunlik' },
          { key: 'bsb', label: 'BSB' },
          { key: 'chsb', label: 'CHSB' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.key
                ? 'bg-sky-600 text-white'
                : 'bg-white text-slate-700 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDayFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            dayFilter === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Barcha kunlar
        </button>
        {DAYS_ORDER.map((d) => {
          const count = grades.filter((g) => g.dayOfWeek === d).length;
          return (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                dayFilter === d
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {d} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 text-sm">
          Baholar yo'q
        </Card>
      ) : (
        dayKeys.map((day) => (
          <Card key={day}>
            <div className="p-4 border-b border-slate-100 bg-sky-50/70">
              <h3 className="font-bold text-slate-800">
                📅 {day}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({grouped[day].length} ta baho)
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                      Fan
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                      Tur
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                      Baho
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                      Sana
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[day].map((g) => {
                    const type = getTypeInfo(g.markType);
                    const score = scoreDisplay(g);
                    return (
                      <tr
                        key={g.emaktabId || g.id}
                        className="border-b border-slate-100 hover:bg-sky-50/40"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">
                          {g.subject}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${type.bg} ${type.text}`}
                          >
                            {type.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-base font-bold ${score.color}`}>
                            {score.text}
                          </span>
                          {score.extra && (
                            <span className="text-xs text-slate-400 ml-1">
                              {score.extra}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDate(g.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}

      <Modal
        open={credModalOpen}
        onClose={() => {
          setCredModalOpen(false);
          setCreds(null);
          setShowPass(false);
        }}
        title="🆘 Favqulodda eMaktab ma'lumotlari"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex gap-2">
            <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <span>
              Har bir ko'rish <strong>admin_audit_log</strong>ga sababi bilan yoziladi.
              Parol 60 soniyadan keyin avtomatik yashiriladi.
            </span>
          </div>

          {!creds ? (
            <form onSubmit={handleRequestCreds} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Ko'rish sababi *
                </label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Masalan: O'quvchi parolini unutdi, qayta tiklash uchun"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCredModalOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={fetchingCreds}>
                  {fetchingCreds ? 'Tekshirilmoqda...' : 'Tasdiqlash va ochish'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-red-600 text-right">
                ⏳ {secondsLeft} soniyadan keyin yopiladi
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400">eMaktab Login</p>
                  <p className="font-mono text-sm font-bold text-slate-800">
                    {creds.login}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(creds.login, 'Login')}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400">eMaktab Parol</p>
                  <p className="font-mono text-sm font-bold text-slate-800">
                    {showPass ? creds.password : '••••••••••••'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(creds.password, 'Parol')}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
