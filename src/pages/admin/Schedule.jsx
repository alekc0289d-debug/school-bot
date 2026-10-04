import { useEffect, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getStudents } from '../../services/students';
import { getScheduleByStudent } from '../../services/schedule';
import { jadval as jadvalFallback, DAYS_ORDER } from '../../constants/jadval';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

export default function Schedule() {
  usePageTitle('Jadval', '📅');
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    getStudents()
      .then((s) => {
        setStudents(s);
        if (s.length > 0) setSelectedId(s[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingLessons(true);
    getScheduleByStudent(selectedId)
      .then((data) => {
        if (data && data.length > 0) {
          setLessons(data);
          setUsingFallback(false);
        } else {
          const flat = jadvalFallback.flatMap((d) =>
            d.lessons.map((l, i) => ({
              ...l,
              dayOfWeek: d.dayOfWeek,
              id: `${d.dayOfWeek}-${l.lessonNumber}-${i}`,
            }))
          );
          setLessons(flat);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        const flat = jadvalFallback.flatMap((d) =>
          d.lessons.map((l, i) => ({
            ...l,
            dayOfWeek: d.dayOfWeek,
            id: `${d.dayOfWeek}-${l.lessonNumber}-${i}`,
          }))
        );
        setLessons(flat);
        setUsingFallback(true);
      })
      .finally(() => setLoadingLessons(false));
  }, [selectedId]);

  const grouped = {};
  lessons.forEach((l) => {
    const day = l.dayOfWeek || 'Boshqa';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(l);
  });

  const dayKeys = Object.keys(grouped).sort((a, b) => {
    const ia = DAYS_ORDER.indexOf(a);
    const ib = DAYS_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Haftalik jadval
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Jami: <strong className="text-slate-700">{lessons.length}</strong> ta dars
            {usingFallback && (
              <span className="ml-2 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                statik ma'lumot
              </span>
            )}
          </p>
        </div>

        {students.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white shadow-soft"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        )}
      </div>

      {loadingLessons ? (
        <Loader />
      ) : lessons.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 text-sm">
          Jadval yo'q
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayKeys.map((day) => {
            // Shu kundagi darslarni raqam bo'yicha guruhlash
            const byNumber = {};
            grouped[day].forEach((l) => {
              const num = l.lessonNumber || 0;
              if (!byNumber[num]) byNumber[num] = [];
              byNumber[num].push(l);
            });

            const lessonNumbers = Object.keys(byNumber)
              .map(Number)
              .sort((a, b) => a - b);

            return (
              <Card key={day} className="overflow-hidden" hover>
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    📅 {day}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {grouped[day].length} ta dars
                  </p>
                </div>

                <div className="p-3 space-y-2">
                  {lessonNumbers.map((num) => {
                    const items = byNumber[num];
                    const first = items[0];

                    return (
                      <div
                        key={num}
                        className="p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">
                              {num}-dars
                            </p>
                          </div>
                          {first.startTime && (
                            <span className="text-[11px] font-bold text-blue-600 whitespace-nowrap bg-blue-100 px-2 py-1 rounded-md">
                              {first.startTime} - {first.endTime || '—'}
                            </span>
                          )}
                        </div>

                        {/* Subgroup — bir vaqtda 2 ta fan */}
                        <div className="space-y-1.5">
                          {items.map((l, i) => (
                            <div
                              key={l.id || i}
                              className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100"
                            >
                              <div className="w-1 h-full min-h-[36px] bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">
                                  {l.subject || '—'}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {l.teacher || '—'}
                                </p>
                                {l.room && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    🚪 {l.room}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}