import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getStudent } from '../../services/students';
import { getGradesByStudent } from '../../services/grades';
import { formatDate } from '../../utils/date';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

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
  return { label: t || 'Kunlik', bg: 'bg-blue-100', text: 'text-blue-700' };
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
        g.score >= 85 ? 'text-emerald-600'
        : g.score >= 70 ? 'text-blue-600'
        : g.score >= 55 ? 'text-yellow-600'
        : 'text-red-600',
    };
  }
  return {
    text: g.score,
    extra: '/10',
    color:
      g.score >= 9 ? 'text-emerald-600'
      : g.score >= 7 ? 'text-blue-600'
      : g.score >= 5 ? 'text-yellow-600'
      : 'text-red-600',
  };
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');

  usePageTitle(student?.fullName || "O'quvchi");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const s = await getStudent(id);
        if (mounted) setStudent(s);
      } catch (err) {
        if (mounted) setError("O'quvchi topilmadi");
      }

      try {
        const g = await getGradesByStudent(id);
        if (mounted) setGrades(g);
      } catch (err) {
        if (mounted) setGrades([]);
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
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
          <h2 className="text-xl font-bold text-slate-800 mb-2">{error}</h2>
        </Card>
      </div>
    );
  }

  if (!student) return null;

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
    ? (
        dailyGrades.reduce((a, g) => a + g.score, 0) / dailyGrades.length
      ).toFixed(2)
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
    <div className="space-y-6">
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {student.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              {student.fullName}
            </h1>
            <p className="text-sm text-slate-500">{student.classId}</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-400">Telefon</p>
                <p className="text-sm font-medium">
                  {student.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Ona telefoni</p>
                <p className="text-sm font-medium">
                  {student.motherPhone || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Ota telefoni</p>
                <p className="text-sm font-medium">
                  {student.fatherPhone || '—'}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Kunlik</p>
          <p className="text-xl font-bold text-blue-600">
            {dailyGrades.length}
          </p>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
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
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
            <div className="p-4 border-b border-slate-100 bg-slate-50">
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
                        className="border-b border-slate-100 hover:bg-slate-50"
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
                          <span
                            className={`text-base font-bold ${score.color}`}
                          >
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
    </div>
  );
}