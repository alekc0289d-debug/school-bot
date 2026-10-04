import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageTitle } from '../../hooks/usePageTitle';

const FEATURES = [
  { icon: '📊', text: "O'quvchilar baholari va davomati bir joyda" },
  { icon: '🔄', text: "eMaktab bilan avtomatik sinxronlash" },
  { icon: '🤖', text: 'Telegram bot orqali jonli xabarnoma' },
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
      () => login(email, password),
      {
        loadingMessage: 'Kirish...',
        successMessage: 'Xush kelibsiz! 👋',
        errorMessage: 'Email yoki parol xato',
      }
    );

    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Chap panel — brend */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl">
              🏫
            </div>
            <span className="text-lg font-semibold tracking-tight">Maktab Tizimi</span>
          </div>

          <div className="max-w-sm animate-slide-up">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Sinfingizni boshqarish endi osonroq
            </h1>
            <p className="text-brand-100 text-base leading-relaxed mb-10">
              Baholar, jadval va davomat — bitta boshqaruv panelida,
              real vaqtda.
            </p>
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-sm text-brand-50/90">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-brand-100/60">© 2026 Maktab Tizimi</p>
        </div>
      </div>

      {/* O'ng panel — forma */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🏫</div>
            <h1 className="text-xl font-bold text-slate-800">Maktab Tizimi</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Xush kelibsiz</h2>
            <p className="text-slate-500 text-sm">Admin panelga kirish uchun tizimga kiring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
                placeholder="admin@maktab.uz"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
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
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium shadow-glow hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500 mb-2">
              O'quvchi sifatida ro'yxatdan o'tish:
            </p>
            <Link
              to="/register"
              className="block w-full text-center bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-medium hover:bg-emerald-100 transition"
            >
              📝 Ro'yxatdan o'tish
            </Link>
          </div>

          <p className="lg:hidden text-center text-xs text-slate-400 mt-8">
            © 2026 Maktab Tizimi
          </p>
        </div>
      </div>
    </div>
  );
}
