import { Menu, Bell, LogOut, User, Snowflake } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [snow, setSnow] = useState(() => {
    try {
      return localStorage.getItem('winter_snow') !== 'off';
    } catch {
      return true;
    }
  });

  const toggleSnow = () => {
    const next = !snow;
    setSnow(next);
    try {
      localStorage.setItem('winter_snow', next ? 'on' : 'off');
    } catch {}
    window.dispatchEvent(new CustomEvent('toggle-snow', { detail: next }));
  };

  return (
    <header className="glass border-b border-sky-200/70 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-sky-100 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-700">
              Maktab Boshqaruv Tizimi
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
              ❄️ Qishki mavsum
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSnow}
            title={snow ? "Qorni o'chirish" : "Qorni yoqish"}
            className={`p-2 rounded-lg transition ${
              snow
                ? 'bg-sky-100 text-sky-600 hover:bg-sky-200'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Snowflake size={18} />
          </button>

          <button className="relative p-2 text-slate-600 hover:bg-sky-100 rounded-lg transition">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 hover:bg-sky-100/70 rounded-lg transition"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-500">Administrator</p>
              </div>
            </button>

            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-sky-100 py-1 z-20 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-500">Administrator</p>
                  </div>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                    <User size={15} /> Profil
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items
