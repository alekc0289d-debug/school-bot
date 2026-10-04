import { useEffect, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getAllGrades } from '../../services/grades';
import { getStudents } from '../../services/students';
import { formatDate } from '../../utils/date';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

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

export default function Grades() {
  usePageTitle('Baholar');
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showOrphans, setShowOrphans] = useState(false);

  useEffect(() => {
    Promise.all([getAllGrades(), getStudents()])
      .then(([g, s]) => {
        setGrades(g);
        const map = {};
        s.forEach((st) => (map[st.id] = st));
        setStudents(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjects = [...new Set(grades.map((g) => g.subject))].sort();
  const orphanCount = grades.filter((g) => !students[g.studentId]).length;

  const filtered = grades.filter((g) => {
    const isOrphan = !students[g.studentId];
    if (!showOrphans && isOrphan) return false;
    if (showOrphans && !isOrphan) return false;
    if (subjectFilter && g.subject !== subjectFilter) return false;
    if (typeFilter !== 'all') {
      const t = (g.markType || '').toUpperCase();
      if (typeFilter === 'daily' && (t.includes('BSB') || t.includes('CHSB')))
        return false;
      if (typeFilter === 'bsb' && !t.includes('BSB')) return false;
      if (typeFilter === 'chsb' && !t.includes('CHSB')) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Baholar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Jami: {grades.length} ta
            {orphanCount > 0 && (
              <span className="ml-2 text-xs text-red-600 font-medium">
                ({orphanCount} ta orphan)
              </span>
            )}
          </p>
        </div>

        {orphanCount > 0 && (
          <button
            onClick={() => setShowOrphans(!showOrphans)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              showOrphans
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            {showOrphans
              ? "✓ Orphanlarni ko'rsatish"
              : `⚠️ Orphan (${orphanCount})`}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
        >
          <option value="">Barcha fanlar ({subjects.length})</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'daily', label: 'Kunlik' },
            { key: 'bsb', label: 'BSB' },
            { key: 'chsb', label: 'CHSB' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                typeFilter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Baholar yo'q
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                    O'quvchi
                  </th>
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                    Kun
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const type = getTypeInfo(g.markType);
                  const score = scoreDisplay(g);
                  const student = students[g.studentId];
                  return (
                    <tr
                      key={g.emaktabId || g.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        !student ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium">
                        {student ? (
                          <span className="text-slate-800">
                            {student.fullName}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs">
                            ❌ O'chirilgan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
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
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {g.dayOfWeek || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}