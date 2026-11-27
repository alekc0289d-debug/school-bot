import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageTitle } from '../../hooks/usePageTitle';

const FEATURES = [
  {
    icon: '❄️',
    text: 'Qishki mavsum: ketma-ket topshiriqlar, testlar va pul mukofoti',
  },
  {
    icon: '📊',
    text: 'Kunlik, BSB, CHSB, topshiriq va testlardan yagona sinf reytingi',
  },
  {
    icon: '🤖',
    text: 'Telegram bot va guruh viktorinalari orqali jonli nazorat',
  },
];

export default function Login() {
  usePageTitle('Kirish');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { loading, execute } = useAsync();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await execute(
      () => login(email.trim(), password),
      {
        loadingMessage: 'Kirish...',
        successMessage: 'Xush kelibsiz! ❄️',
        errorMessage: 'Email yoki parol xato',
      }
    );
    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden winter-aurora">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3 anim-stagger-1">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl animate-float-slow">
              ❄️
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block">
                Maktab Tizimi
              </span>
              <span className="text-xs text-sky-100">
                Qishki mavsum · 9-A sinf
              </span>
            </div>
          </div>

          <div className="max-w-sm">
            <h1 className="text-4xl font-extrabold leading-tight mb-4 anim-stagger-2">
              Sinfingizni boshqarish endi yanada qiziqarli
            </h1>
            <p className="text-sky-100 text-base leading-relaxed mb-8 anim-stagger-3">
              Baholar, jadval, testlar, ketma-ket topshiriqlar va oylik pul mukofoti —
              bitta boshqaruv panelida.
            </p>
            <div className="space-y-3.5 anim-stagger-4">
              {FEATURES.map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-sm text-white/95 font-medium">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-sky-100/70">© 2026 Maktab Tizimi</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm frost-card p-7 rounded-2xl anim-pop">
          <div className="lg:hidden text-center mb-6">
            <div className="text-4xl mb-2 animate-float-slow">❄️🏫</div>
            <h1 className="text-xl font-bold text-slate-800">Maktab Tizimi</h1>
          </div>

          <div className="mb-6 anim-stagger-1">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              Xush kelibsiz ❄️
            </h2>
            <p className="text-slate-500 text-sm">
              Admin panelga kirish uchun tizimga kiring
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="anim-stagger-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 outline-none transition placeholder:text-slate-400"
                placeholder="admin@maktab.uz"
                autoComplete="email"
                required
              />
            </div>

            <div className="anim-stagger-3">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 outline-none transition placeholder:text-slate-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ice-shimmer anim-stagger-4 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Kirish...' : '❄️ Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sky-100 anim-stagger-5">
            <p className="text-center text-sm text-slate-500 mb-2">
              O'quvchi sifatida ro'yxatdan o'tish:
            </p>
            <Link
              to="/register"
              className="btn-ice-shimmer block w-full text-center bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 py-2.5 rounded-xl font-semibold hover:from-emerald-100 hover:to-teal-100 transition border border-emerald-200"
            >
              ❄️ Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
