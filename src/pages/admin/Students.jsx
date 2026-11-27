import { useState, useEffect, useMemo, memo } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Bot, BotOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDebounce } from '../../hooks/useDebounce';
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from '../../services/students';
import {
  formatUzPhoneDisplay,
  detectGenderFromLastName,
} from '../../utils/uzbekValidation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import StudentForm from '../../components/forms/StudentForm';

function ConnectionBadge({ connected, blocked }) {
  if (connected && blocked) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-red-50 text-red-700 rounded-full">
        <BotOff size={12} /> Bloklangan
      </span>
    );
  }
  return connected ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
      <Bot size={12} /> Ulangan
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
      <BotOff size={12} /> Ulanmagan
    </span>
  );
}

const StudentRow = memo(function StudentRow({ student, onEdit, onDelete }) {
  const gender =
    student.gender ||
    detectGenderFromLastName(
      student.lastName || student.fullName?.split(' ').slice(1).join(' ')
    );
  const avatarGrad =
    gender === 'female'
      ? 'from-pink-500 to-rose-500'
      : 'from-sky-500 to-indigo-600';

  return (
    <tr className="border-b border-slate-100 hover:bg-sky-50/50 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 bg-gradient-to-br ${avatarGrad} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}
          >
            {student.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              <span>{student.fullName}</span>
              {gender === 'female' && <span title="Qiz bola">👧</span>}
              {gender === 'male' && <span title="O'g'il bola">👦</span>}
            </p>
            <p className="text-xs text-slate-500">
              {formatUzPhoneDisplay(student.phone)}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs font-medium px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full">
          {student.classId}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">
        {formatUzPhoneDisplay(student.motherPhone)}
      </td>
      <td className="py-3 px-4">
        <ConnectionBadge
          connected={!!student.tgId}
          blocked={!!student.botBlocked}
        />
      </td>
      <td className="py-3 px-4">
        <ConnectionBadge
          connected={!!student.parentTgId}
          blocked={!!student.parentBotBlocked}
        />
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">
        {student.gradesCount || 0} baho
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-1">
          <Link
            to={`/students/${student.id}`}
            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition"
          >
            <Eye size={15} />
          </Link>
          <button
            onClick={() => onEdit(student)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => onDelete(student)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function Students() {
  usePageTitle("O'quvchilar", '👥');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [studentBotFilter, setStudentBotFilter] = useState('all');
  const [parentBotFilter, setParentBotFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 250);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch {
      toast.error('Yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return students.filter((s) => {
      if (q) {
        const matches =
          s.fullName?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.classId?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      const studentState = !s.tgId
        ? 'not_connected'
        : s.botBlocked
        ? 'blocked'
        : 'connected';
      const parentState = !s.parentTgId
        ? 'not_connected'
        : s.parentBotBlocked
        ? 'blocked'
        : 'connected';

      if (studentBotFilter !== 'all' && studentState !== studentBotFilter) {
        return false;
      }
      if (parentBotFilter !== 'all' && parentState !== parentBotFilter) {
        return false;
      }
      if (genderFilter !== 'all') {
        const g =
          s.gender ||
          detectGenderFromLastName(
            s.lastName || s.fullName?.split(' ').slice(1).join(' ')
          );
        if (g !== genderFilter) return false;
      }
      return true;
    });
  }, [students, debouncedSearch, studentBotFilter, parentBotFilter, genderFilter]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateStudent(editing.id, data);
        toast.success('Yangilandi ✅');
      } else {
        await addStudent(data);
        toast.success("Qo'shildi ✅");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Saqlashda xato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`"${s.fullName}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteStudent(s.id);
      toast.success("O'chirildi 🗑️");
      load();
    } catch {
      toast.error("O'chirishda xato");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            ❄️ O'quvchilar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Jami: <strong>{students.length}</strong> ta · Ko'rsatilmoqda:{' '}
            <strong>{filtered.length}</strong> ta
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} className="inline mr-1.5" /> Yangi o'quvchi
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki telefon..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-sky-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
          />
        </div>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-sky-200 rounded-xl text-sm outline-none"
        >
          <option value="all">Jins: hammasi</option>
          <option value="male">👦 O'g'il bolalar</option>
          <option value="female">👧 Qiz bolalar</option>
        </select>

        <select
          value={studentBotFilter}
          onChange={(e) => setStudentBotFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-sky-200 rounded-xl text-sm outline-none"
        >
          <option value="all">O'quvchi bot: hammasi</option>
          <option value="connected">O'quvchi bot: ulangan</option>
          <option value="blocked">O'quvchi bot: bloklagan</option>
          <option value="not_connected">O'quvchi bot: ulanmagan</option>
        </select>

        <select
          value={parentBotFilter}
          onChange={(e) => setParentBotFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-sky-200 rounded-xl text-sm outline-none"
        >
          <option value="all">Ota-ona bot: hammasi</option>
          <option value="connected">Ota-ona bot: ulangan</option>
          <option value="blocked">Ota-ona bot: bloklagan</option>
          <option value="not_connected">Ota-ona bot: ulanmagan</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">❄️</div>
            <p className="text-slate-500 text-sm font-medium">
              Hech narsa topilmadi
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-50/70">
                  {[
                    "O'quvchi",
                    'Sinf',
                    'Ona telefoni',
                    "O'quvchi bot",
                    'Ota-ona bot',
                    'Baholar',
                    'Amallar',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onEdit={(st) => {
                      setEditing(st);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Tahrirlash' : "Yangi o'quvchi"}
      >
        <StudentForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
