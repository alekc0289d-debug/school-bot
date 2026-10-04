import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { usePageTitle } from '../../hooks/usePageTitle';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

export default function SyncLog() {
  usePageTitle('Sync tarixi');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'emaktab_sync_log'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    getDocs(q)
      .then((s) => setLogs(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) =>
    s === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Sync tarixi</h1>
      <Card>
        {loading ? (
          <Loader />
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Log yo'q</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {log.studentId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.method} · {log.gradesCount || 0} ta baho
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}