import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  PartyPopper,
  Coins,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import UzPhoneInput from '../components/ui/UzPhoneInput';
import Card from '../components/ui/Card';
import {
  normalizeUzPhone,
  cleanNamePart,
  detectGenderFromLastName,
} from '../utils/uzbekValidation';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function Register() {
  usePageTitle("Ro'yxatdan o'tish");

  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    login: '',
    password: '',
    phone: '',
    motherPhone: '',
    fatherPhone: '',
  });

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
          const full = `${cleanNamePart(form.firstName)} ${cleanNamePart(form.lastName)}`.trim();
          setResult({
            fullName: full,
            gender: form.gender || detectGenderFromLastName(form.lastName),
            message: data.message,
          });
          toast.success('Muvaffaqiyat! ❄️', { duration: 4000 });
        } else if (data.status === 'error') {
          clearInterval(interval);
          setLoading(false);
          toast.error(data.message, { duration: 6000 });
        }
      } catch (err) {
        console.error('Polling xato:', err);
        failures += 1;
        if (failures >= 10) {
          stop("Server bilan aloqa yo'q.");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, form.firstName, form.lastName, form.gender]);

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'lastName') {
        const detected = detectGenderFromLastName(value);
        if (detected) next.gender = detected;
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    const login = form.login.trim();
    const password = form.password;
    const firstName = cleanNamePart(form.firstName);
    const lastName = cleanNamePart(form.lastName);

    if (!login) errs.login = 'eMaktab loginni kiriting';
    if (!password) errs.password = 'Parolni kiriting';
    if (!firstName || firstName.length < 2) errs.firstName = 'Ismingizni kiriting';
    if (!lastName || lastName.length < 2) errs.lastName = 'Familiyangizni kiriting';

    const phone = normalizeUzPhone(form.phone);
    if (!phone) {
      errs.phone = "O'zbekiston mobil raqamini to'liq kiriting (9 ta raqam)";
    }

    const motherPhone = normalizeUzPhone(form.motherPhone);
    if (!motherPhone) {
      errs.motherPhone = "Onangizning to'g'ri O'zbekiston raqamini kiriting";
    }

    if (phone && motherPhone && phone === motherPhone) {
      errs.motherPhone = "O'quvchi va onaning telefon raqami bir xil bo'lishi mumkin emas";
    }

    let fatherPhone = '';
    if (form.fatherPhone && form.fatherPhone.trim()) {
      fatherPhone = normalizeUzPhone(form.fatherPhone);
      if (!fatherPhone) {
        errs.fatherPhone = "Otangizning raqami noto'g'ri";
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Maydonlarni to'g'ri to'ldiring");
      return;
    }

    if (!consent) {
      toast.error("Iltimos, foydalanish va oylik 2 000 so'm to'lov shartlariga rozilik bering");
      return;
    }

    const gender = form.gender || detectGenderFromLastName(lastName) || '';
    const payload = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      gender,
      login,
      password,
      phone,
      motherPhone,
      fatherPhone,
      consent,
    };

    setLoading(true);
    setStatus(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleReset = () => {
    setTaskId(null);
    setStatus(null);
    setResult(null);
    setErrors({});
    setForm({
      firstName: '',
      lastName: '',
      gender: '',
      login: '',
      password: '',
      phone: '',
      motherPhone: '',
      fatherPhone: '',
    });
    setConsent(false);
  };

  if (result) {
    const genderLabel =
      result.gender === 'female'
        ? '👧 Qiz bola'
        : result.gender === 'male'
        ? "👦 O'g'il bola"
        : '🎓';

    return (
      <div className="min-h-screen winter-aurora flex items-center justify-center p-4">
        <div className="w-full max-w-md anim-pop">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-slow">
              <PartyPopper size={40} className="text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Muvaffaqiyatli! ❄️
            </h1>

            <p className="text-slate-600 text-sm mb-6">
              Hurmatli <strong>{result.fullName}</strong> ({genderLabel}),
              siz muvaffaqiyatli ro'yxatdan o'tdingiz.
            </p>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-5 text-left anim-stagger-2">
              <p className="text-xs text-sky-900 mb-2 font-bold">
                📋 Keyingi qadam:
              </p>
              <ul className="text-xs text-sky-800 space-y-1.5">
                <li>✅ Ma'lumotlaringiz tizimga saqlandi</li>
                <li>✅ eMaktab baholaringiz va jadvalingiz yuklandi</li>
                <li>🤖 Telegram botga kirib /start bosing (o'zingiz va ota-onangiz)</li>
                <li>🏆 Topshiriqlar va testlarni bajarib oylik pul mukofoti yuting!</li>
              </ul>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 text-sm text-sky-700 hover:text-sky-900 font-semibold"
            >
              Yangi o'quvchi qo'shish
            </button>
          </Card>
        </div>
      </div>
    );
  }

  if (taskId && status) {
    const isError = status.status === 'error';

    return (
      <div className="min-h-screen winter-aurora flex items-center justify-center p-4">
        <div className="w-full max-w-md anim-pop">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className={`text-5xl mb-3 ${isError ? '' : 'animate-float-slow'}`}>
                {isError ? '❌' : '❄️'}
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-1">
                {isError ? 'Xatolik' : "Ro'yxatdan o'tilmoqda..."}
              </h1>
              <p className="text-slate-600 text-sm">{status.message}</p>
            </div>

            <div className="mb-6">
              <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isError
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-2 font-bold">
                {status.progress}%
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-2 text-slate-400">live status</span>
              </div>
              <div className="space-y-1">
                <div>&gt; {status.message}</div>
                {status.step === 'login' && status.progress >= 15 && (
                  <div className="text-emerald-400">&gt; ✅ login muvaffaqiyatli</div>
                )}
                {status.step === 'fetch' && (
                  <div className="text-sky-400">&gt; ma'lumot olinmoqda...</div>
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

  return (
    <div className="min-h-screen winter-aurora py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl animate-slide-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-white/95 mb-4 hover:underline font-medium text-sm"
        >
          <ArrowLeft size={16} /> Kirish sahifasiga qaytish
        </Link>

        <Card className="p-6 sm:p-8">
          <div className="text-center mb-6 anim-stagger-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-3">
              <Sparkles size={14} /> ❄️ Qishki mavsum · 9-A sinf
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Ro'yxatdan o'tish
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Har bir maydonni diqqat bilan to'ldiring
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1-BO'LIM: eMaktab */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-3.5 anim-stagger-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  1️⃣ eMaktab hisobingiz
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 font-semibold">
                  <Shield size={13} /> AES-256
                </span>
              </div>

              <Input
                label="eMaktab login *"
                value={form.login}
                onChange={(e) => handleChange('login', e.target.value)}
                onBlur={() => handleChange('login', form.login.trim())}
                placeholder="Loginni kiriting"
                error={errors.login}
                required
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  eMaktab parol *
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Parolni kiriting"
                    required
                    disabled={loading}
                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 outline-none transition ${
                      errors.password ? 'border-red-300' : 'border-sky-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* 2-BO'LIM: ALOHIDA ISM VA FAMILIYA */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/70 space-y-3.5 anim-stagger-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-indigo-800">
                2️⃣ O'quvchi ism-familiyasi
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Ismingiz *"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onBlur={() => handleChange('firstName', cleanNamePart(form.firstName))}
                  placeholder="Masalan: Ozodbek"
                  error={errors.firstName}
                  required
                  disabled={loading}
                />
                <Input
                  label="Familiyangiz *"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  onBlur={() => handleChange('lastName', cleanNamePart(form.lastName))}
                  placeholder="Karimov yoki Karimova"
                  error={errors.lastName}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jinsi (familiyangiz oxiriga qarab avtomatik belgilanadi):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleChange('gender', 'male')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      form.gender === 'male'
                        ? 'bg-sky-100 border-sky-500 text-sky-800 shadow-sm anim-pop'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    👦 O'g'il bola (-v)
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleChange('gender', 'female')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      form.gender === 'female'
                        ? 'bg-pink-100 border-pink-400 text-pink-800 shadow-sm anim-pop'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    👧 Qiz bola (-a)
                  </button>
                </div>
              </div>
            </div>

            {/* 3-BO'LIM: TELEFON RAQAMLARI (+998 AVTOMATIK) */}
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/70 space-y-3.5 anim-stagger-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-cyan-800">
                3️⃣ Telegram bot uchun telefon raqamlari
              </span>

              <UzPhoneInput
                label="O'zingizning telefoningiz *"
                value={form.phone}
                onChange={(v) => handleChange('phone', v)}
                error={errors.phone}
                required
                disabled={loading}
              />

              <UzPhoneInput
                label="Onangizning telefoni *"
                value={form.motherPhone}
                onChange={(v) => handleChange('motherPhone', v)}
                error={errors.motherPhone}
                required
                disabled={loading}
              />

              <UzPhoneInput
                label="Otangizning telefoni (ixtiyoriy)"
                value={form.fatherPhone}
                onChange={(v) => handleChange('fatherPhone', v)}
                error={errors.fatherPhone}
                disabled={loading}
              />
            </div>

            {/* 4-BO'LIM: TO'LOV VA ROZILIK */}
            <div className="space-y-3 anim-stagger-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex gap-2.5">
                <Coins size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Oylik to'lov: 2 000 so'm.</strong> Serverlar, 24/7 bot va oy
                  oxiridagi <strong>Pul mukofoti 💰</strong> jamg'armasi uchun sarflanadi.
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-sky-600"
                    disabled={loading}
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    Men{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-sky-600 hover:underline font-semibold"
                    >
                      foydalanish shartlari
                    </Link>
                    ga, oylik <strong>2 000 so'm</strong> to'lov shartiga hamda eMaktab
                    ma'lumotlarim olinishiga roziman.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !consent}
                className="w-full py-3 text-base"
              >
                {loading ? 'Yuborilmoqda...' : "❄️ Ro'yxatdan o'tish"}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 Maktab Tizimi · 9-A sinf
          </p>
        </Card>
      </div>
    </div>
  );
}
