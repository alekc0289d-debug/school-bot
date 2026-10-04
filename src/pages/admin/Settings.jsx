import { useEffect, useState } from 'react';
import { Save, Phone, Send, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';

export default function Settings() {
  usePageTitle('Sozlamalar', '⚙️');
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    className: '9-A',
    classGroupId: '',
    curatorName: '',
    curatorTgId: '',
    curatorPhone: '',
    adminName: '',
    adminTgId: '',
    adminPhone: '',
    schoolName: 'Maktab',
    schoolPhone: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const ref = doc(db, 'settings', 'general');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSettings((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ref = doc(db, 'settings', 'general');
      await setDoc(
        ref,
        { ...settings, updatedAt: serverTimestamp(), updatedBy: user?.uid },
        { merge: true }
      );
      toast.success('Sozlamalar saqlandi ✅');
    } catch (err) {
      toast.error('Saqlashda xato');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Sozlamalar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sinf va admin ma'lumotlari
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="inline mr-1.5" />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      {/* SINF */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Sinf ma'lumotlari</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sinf nomi"
            value={settings.className}
            onChange={(e) => handleChange('className', e.target.value)}
            placeholder="9-A"
          />
          <Input
            label="Telegram guruh ID"
            value={settings.classGroupId}
            onChange={(e) => handleChange('classGroupId', e.target.value)}
            placeholder="-1001234567890"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          💡 Guruh ID ni olish: guruhga @userinfobot ni qo'shing
        </p>
      </Card>

      {/* SINF RAHBARI */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <User size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Sinf rahbari</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Ism-familiya"
            value={settings.curatorName}
            onChange={(e) => handleChange('curatorName', e.target.value)}
            placeholder="Raximova M.T."
          />
          <Input
            label="Telefon raqam"
            value={settings.curatorPhone}
            onChange={(e) => handleChange('curatorPhone', e.target.value)}
            placeholder="+998 90 123 45 67"
          />
          <Input
            label="Telegram ID"
            value={settings.curatorTgId}
            onChange={(e) => handleChange('curatorTgId', e.target.value)}
            placeholder="123456789"
          />
        </div>
      </Card>

      {/* ADMIN */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Phone size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Administrator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Ism-familiya"
            value={settings.adminName}
            onChange={(e) => handleChange('adminName', e.target.value)}
            placeholder="Admin"
          />
          <Input
            label="Telefon raqam"
            value={settings.adminPhone}
            onChange={(e) => handleChange('adminPhone', e.target.value)}
            placeholder="+998 90 123 45 67"
          />
          <Input
            label="Telegram ID"
            value={settings.adminTgId}
            onChange={(e) => handleChange('adminTgId', e.target.value)}
            placeholder="123456789"
          />
        </div>
      </Card>

      {/* MAKTAB */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Send size={20} className="text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Maktab</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Maktab nomi"
            value={settings.schoolName}
            onChange={(e) => handleChange('schoolName', e.target.value)}
            placeholder="Maktab №1"
          />
          <Input
            label="Maktab telefoni"
            value={settings.schoolPhone}
            onChange={(e) => handleChange('schoolPhone', e.target.value)}
            placeholder="+998 71 123 45 67"
          />
        </div>
      </Card>

      {/* PROFIL */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Sizning profil</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Rol:</span>
            <span className="font-medium">{role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">UID:</span>
            <span className="font-mono text-xs text-slate-400">{user?.uid}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}