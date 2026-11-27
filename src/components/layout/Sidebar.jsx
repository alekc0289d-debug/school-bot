import { NavLink } from 'react-router-dom';
import { X, Snowflake } from 'lucide-react';
import { MENU_ITEMS } from '../../constants/menu';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ open, setOpen }) {
  const { role } = useAuth();
  const filtered = MENU_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-64 h-screen bg-gradient-to-b from-slate-900 via-sky-950 to-indigo-950 text-white
          flex flex-col transform transition-transform duration-300 border-r border-sky-800/40
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-sky-500/30 animate-float-slow">
              ❄️
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight flex items-center gap-1.5">
                Maktab
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 font-semibold">
                  Qish
                </span>
              </h1>
              <p className="text-[11px] text-sky-300/75">9-A sinf · 2026</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {filtered.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 translate-x-0.5'
                    : 'text-slate-300 hover:bg-sky-900/45 hover:text-white hover:translate-x-0.5'
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              <span className="text-base opacity-50 group-hover:opacity-95 transition">
                {item.emoji}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-900/40 text-[11px] text-sky-300/60 flex items-center justify-between">
          <span>© 2026 Maktab Tizimi</span>
          <Snowflake size={14} className="text-sky-400 animate-pulse" />
        </div>
      </aside>
    </>
  );
}
