import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function StudentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    fullName: '',
    classId: '9-A',
    phone: '',
    motherPhone: '',
    fatherPhone: '',
    status: 'active',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        fullName: initial.fullName || '',
        classId: initial.classId || '9-A',
        phone: initial.phone || '',
        motherPhone: initial.motherPhone || '',
        fatherPhone: initial.fatherPhone || '',
        status: initial.status || 'active',
      });
    }
  }, [initial]);

  const handle = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="To'liq ism-familiya *"
        value={form.fullName}
        onChange={(e) => handle('fullName', e.target.value)}
        placeholder="Ism familiya"
        required
      />
      <Input
        label="Sinf"
        value={form.classId}
        onChange={(e) => handle('classId', e.target.value)}
        placeholder="9-A"
      />
      <Input
        label="Telefon (o'zi) *"
        value={form.phone}
        onChange={(e) => handle('phone', e.target.value)}
        placeholder="+998 90 123 45 67"
        required
      />
      <Input
        label="Onasining telefoni *"
        value={form.motherPhone}
        onChange={(e) => handle('motherPhone', e.target.value)}
        placeholder="+998 90 123 45 68"
        required
      />
      <Input
        label="Otasining telefoni (ixtiyoriy)"
        value={form.fatherPhone}
        onChange={(e) => handle('fatherPhone', e.target.value)}
        placeholder="+998 90 123 45 69"
      />
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </form>
  );
}