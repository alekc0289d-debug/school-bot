import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
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
          w-64 h-screen bg-slate-900 text-white
          flex flex-col transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-glow">
              🏫
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Maktab</h1>
              <p className="text-[11px] text-slate-400">9-A sinf</p>
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              <span className="text-base opacity-40 group-hover:opacity-70 transition">
                {item.emoji}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-500">
          © 2026 Maktab Tizimi
        </div>
      </aside>
    </>
  );
}