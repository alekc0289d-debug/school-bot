import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function Register() {
  usePageTitle("Ro'yxatdan o'tish");

  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    login: '',
    password: '',
    phone: '',
    motherPhone: '',
    fatherPhone: '',
  });

  const navigate = useNavigate();

  // ============================================
  // POLLING
  // ============================================
  useEffect(() => {
    if (!taskId) return;

    const startedAt = Date.now();
    const MAX_MS = 5 * 60 * 1000;
    let failures = 0;

    const stop = (message) => {
      clearInterval(interval);
      setLoading(false);
      toast.error(message, { duration: 6000 });
    };

    const interval = setInterval(async () => {
      if (Date.now() - startedAt > MAX_MS) {
        stop("Vaqt tugadi. Keyinroq qayta urinib ko'ring.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/register/status/${taskId}`);
        if (res.status === 404) {
          stop("Jarayon topilmadi (server qayta ishga tushgan bo'lishi mumkin). Qayta urinib ko'ring.");
          return;
        }
        const data = await res.json();
        failures = 0;
        setStatus(data);

        if (data.status === 'done') {
          clearInterval(interval);
          setLoading(false);
          setResult({
            fullName: form.fullName,
            message: data.message,
          });
          toast.success('Muvaffaqiyat!', { duration: 4000 });
        } else if (data.status === 'error') {
          clearInterval(interval);
          setLoading(false);
          toast.error(data.message, { duration: 6000 });
        }
      } catch (err) {
        console.error('Polling xato:', err);
        failures += 1;
        if (failures >= 10) stop("Server bilan aloqa yo'q.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, form.fullName]);

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consent) {
      toast.error('Iltimos, foydalanish shartlariga rozilik bering');
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Xatolik');
      }

      setTaskId(data.task_id);
    } catch (err) {
      toast.error(err.message || 'Xatolik');
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTaskId(null);
    setStatus(null);
    setResult(null);
    setForm({
      fullName: '',
      login: '',
      password: '',
      phone: '',
      motherPhone: '',
      fatherPhone: '',
    });
    setConsent(false);
  };

  // ============================================
  // MUVAFFAQIYAT EKRANI
  // ============================================
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={40} className="text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Muvaffaqiyatli!
            </h1>

            <p className="text-slate-600 text-sm mb-6">
              Hurmatli <strong>{result.fullName}</strong>, siz muvaffaqiyatli
              ro'yxatdan o'tdingiz.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-blue-800 mb-2">
                <strong>📋 Keyingi qadam:</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>✅ Ma'lumotlaringiz tizimga yuborildi</li>
                <li>✅ eMaktab baholaringiz yuklandi</li>
                <li>⏳ Admin sizni tasdiqlagach, tizimga kira olasiz</li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-6">
              <p className="text-xs text-emerald-800">
                💡 Xabar admin tasdiqlagach, ota-onangizning telefon raqamiga
                yuboriladi.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Yangi o'quvchi qo'shish
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              © 2026 Maktab Tizimi
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // STATUS DASHBOARD (jarayon davomida)
  // ============================================
  if (taskId && status) {
    const isError = status.status === 'error';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className={`text-5xl mb-3 ${isError ? '' : 'animate-bounce'}`}>
                {isError ? '❌' : '⏳'}
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                {isError ? 'Xatolik' : "Ro'yxatdan o'tilmoqda..."}
              </h1>
              <p className="text-gray-600 text-sm mt-1">{status.message}</p>
            </div>

            <div className="mb-6">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isError ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">
                {status.progress}%
              </p>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="ml-2 text-slate-400">live status</span>
              </div>
              <div className="space-y-1">
                <div>&gt; {status.message}</div>
                {status.step === 'login' && status.progress >= 15 && (
                  <div className="text-emerald-400">&gt; ✅ login muvaffaqiyatli</div>
                )}
                {status.step === 'fetch' && (
                  <div className="text-blue-400">&gt; ma'lumot olinmoqda...</div>
                )}
                {status.step === 'save' && (
                  <div className="text-yellow-400">&gt; firestore'ga saqlanmoqda...</div>
                )}
                {isError && (
                  <div className="text-red-400">&gt; ❌ xatolik yuz berdi</div>
                )}
              </div>
            </div>

            {isError && (
              <div className="mt-6">
                <Button onClick={handleReset} className="w-full">
                  Qayta urinish
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // FORMA
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-white mb-4 hover:underline"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Ro'yxatdan o'tish
            </h1>
            <p className="text-gray-500 text-sm">9-A sinf uchun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
              <Shield size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                eMaktab login-parolingiz <strong>AES-256</strong> bilan
                shifrlanadi. Faqat sizning ma'lumotlaringiz uchun ishlatiladi.
              </span>
            </div>

            <Input
              label="eMaktab login *"
              value={form.login}
              onChange={(e) => handleChange('login', e.target.value)}
              placeholder="Login kiriting"
              required
              disabled={loading}
            />

            <Input
              label="eMaktab parol *"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Parolni kiriting"
              required
              disabled={loading}
            />

            <Input
              label="To'liq ism-familiya *"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Ism va familiyangizni kiriting"
              required
              disabled={loading}
            />

            <hr className="my-4 border-slate-200" />

            <Input
              label="Telefon (o'zingiz) *"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+998 90 123 45 67"
              required
              disabled={loading}
            />

            <Input
              label="Onangizning telefoni *"
              value={form.motherPhone}
              onChange={(e) => handleChange('motherPhone', e.target.value)}
              placeholder="+998 90 123 45 68"
              required
              disabled={loading}
            />

            <Input
              label="Otangizning telefoni (ixtiyoriy)"
              value={form.fatherPhone}
              onChange={(e) => handleChange('fatherPhone', e.target.value)}
              placeholder="+998 90 123 45 69"
              disabled={loading}
            />

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-600"
                  disabled={loading}
                />
                <span className="text-sm text-slate-700">
                  Men{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    foydalanish shartlari
                  </Link>
                  ga roziman va tizim mening eMaktab hisobimga avtomatik kirib
                  ma'lumot olishiga ruxsat beraman.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !consent}
              className="w-full"
            >
              {loading ? 'Boshlanmoqda...' : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Maktab Tizimi
          </p>
        </Card>
      </div>
    </div>
  );
}