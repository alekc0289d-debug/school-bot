import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  getCaptchaQueue, submitCaptchaAnswer, dismissCaptcha,
} from '../../services/captcha';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

// Worker rasmni toza base64 qilib saqlaydi (data: prefiksisiz)
const toSrc = (img) =>
  img.startsWith('data:') ? img : `data:image/png;base64,${img}`;

const STATUS_LABEL = {
  pending: { text: 'Kutilmoqda', cls: 'bg-amber-50 text-amber-700' },
  answered: { text: 'Tekshirilmoqda', cls: 'bg-blue-50 text-blue-700' },
  failed: { text: 'Xato (3 urinish)', cls: 'bg-red-50 text-red-700' },
};

function CaptchaItem({ item, onDone }) {
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const st = STATUS_LABEL[item.status] || STATUS_LABEL.pending;

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitCaptchaAnswer(item.id, answer);
      toast.success('Javob yuborildi. Worker tekshiradi.');
      setAnswer('');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Xatolik');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Bu captchani navbatdan o'chirasizmi?")) return;
    try {
      await dismissCaptcha(item.id);
      onDone();
    } catch (err) {
      toast.error(err.message || 'Xatolik');
    }
  };

  return (
    <div className="p-4 border rounded-xl space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-medium break-all">{item.login || item.id}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
      </div>

      {item.captchaImage ? (
        <img
          src={toSrc(item.captchaImage)}
          alt="captcha"
          className="border rounded bg-white"
        />
      ) : (
        <p className="text-sm text-slate-400">Rasm saqlanmagan</p>
      )}

      {item.errorMessage && (
        <p className="text-xs text-red-600">{item.errorMessage}</p>
      )}

      {item.status !== 'answered' && (
        <form onSubmit={send} className="flex gap-2 flex-wrap">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Rasmdagi belgilar"
            autoComplete="off"
            className="flex-1 min-w-[10rem] px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={busy || !answer.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Yuborish
          </button>
          <button
            type="button"
            onClick={remove}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200"
          >
            O'chirish
          </button>
        </form>
      )}
    </div>
  );
}

export default function CaptchaQueue() {
  usePageTitle('Captcha navbati');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getCaptchaQueue()
      .then(setItems)
      .catch((err) => {
        console.error(err);
        toast.error("Navbatni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Captcha navbati</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kutayotgan: {items.length} ta
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          title="Yangilash"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-500">Hozircha captcha yo'q ✅</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <CaptchaItem key={item.id} item={item} onDone={load} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
