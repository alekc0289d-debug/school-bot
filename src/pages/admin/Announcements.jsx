import { useEffect, useState } from 'react';
import { Plus, Send, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';

export default function Announcements() {
  usePageTitle("E'lonlar", '📢');
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all',
  });

  const load = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      );
      const s = await getDocs(q);
      setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Sarlavha va matn majburiy');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        ...form,
        authorId: user?.uid,
        authorEmail: user?.email,
        createdAt: serverTimestamp(),
      });
      toast.success("E'lon yaratildi ✅");
      setModalOpen(false);
      setForm({ title: '', body: '', audience: 'all' });
      load();
    } catch (err) {
      toast.error('Saqlashda xato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast.success("O'chirildi");
      load();
    } catch (err) {
      toast.error("O'chirishda xato");
    }
  };

  const audienceLabels = {
    all: 'Hammaga',
    parents: 'Ota-onalarga',
    students: "O'quvchilarga",
    staff: 'Xodimlarga',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            E'lonlar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Jami: {items.length} ta
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="inline mr-1.5" /> Yangi e'lon
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">E'lonlar yo'q</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} hover className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {audienceLabels[item.audience] || item.audience}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {item.body}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    {item.authorEmail} ·{' '}
                    {item.createdAt?.toDate?.().toLocaleString('uz-UZ') ||
                      '—'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yangi e'lon"
      >
        <div className="space-y-4">
          <Input
            label="Sarlavha *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Muhim e'lon"
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Matn *
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition min-h-[120px]"
              placeholder="E'lon matni..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kimga
            </label>
            <select
              value={form.audience}
              onChange={(e) =>
                setForm({ ...form, audience: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white"
            >
              <option value="all">Hammaga</option>
              <option value="parents">Ota-onalarga</option>
              <option value="students">O'quvchilarga</option>
              <option value="staff">Xodimlarga</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Send size={14} className="inline mr-1.5" />
              {saving ? 'Yuborilmoqda...' : 'Yuborish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}