import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import UzPhoneInput from '../ui/UzPhoneInput';
import Button from '../ui/Button';
import {
  normalizeUzPhone,
  cleanNamePart,
  detectGenderFromLastName,
} from '../../utils/uzbekValidation';

export default function StudentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    classId: '9-A',
    phone: '',
    motherPhone: '',
    fatherPhone: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      const parts = (initial.fullName || '').trim().split(/\s+/);
      const firstName = initial.firstName || parts[0] || '';
      const lastName = initial.lastName || parts.slice(1).join(' ') || '';
      setForm({
        firstName,
        lastName,
        gender: initial.gender || detectGenderFromLastName(lastName),
        classId: initial.classId || '9-A',
        phone: initial.phone || '',
        motherPhone: initial.motherPhone || '',
        fatherPhone: initial.fatherPhone || '',
        status: initial.status || 'active',
      });
    }
  }, [initial]);

  const handle = (k, v) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (k === 'lastName') {
        const autoGender = detectGenderFromLastName(v);
        if (autoGender) next.gender = autoGender;
      }
      return next;
    });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};

    const firstName = cleanNamePart(form.firstName);
    const lastName = cleanNamePart(form.lastName);
    if (!firstName) errs.firstName = 'Ismni kiriting';
    if (!lastName) errs.lastName = 'Familiyani kiriting';

    const phone = normalizeUzPhone(form.phone);
    if (!phone) {
      errs.phone = "To'g'ri O'zbekiston raqamini kiriting";
    }

    const motherPhone = normalizeUzPhone(form.motherPhone);
    if (!motherPhone) {
      errs.motherPhone = "Onasining to'g'ri raqamini kiriting";
    }

    if (phone && motherPhone && phone === motherPhone) {
      errs.motherPhone = "O'quvchi va onasining raqami bir xil bo'lmasligi kerak";
    }

    let fatherPhone = '';
    if (form.fatherPhone && form.fatherPhone.trim()) {
      fatherPhone = normalizeUzPhone(form.fatherPhone);
      if (!fatherPhone) {
        errs.fatherPhone = "Otasining raqami noto'g'ri";
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const gender = form.gender || detectGenderFromLastName(lastName) || '';
    onSubmit({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      gender,
      classId: cleanNamePart(form.classId) || '9-A',
      phone,
      motherPhone,
      fatherPhone,
      status: form.status,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Ism *"
          value={form.firstName}
          onChange={(e) => handle('firstName', e.target.value)}
          onBlur={() => handle('firstName', cleanNamePart(form.firstName))}
          placeholder="Ozodbek"
          error={errors.firstName}
          required
        />
        <Input
          label="Familiya *"
          value={form.lastName}
          onChange={(e) => handle('lastName', e.target.value)}
          onBlur={() => handle('lastName', cleanNamePart(form.lastName))}
          placeholder="Karimov / Karimova"
          error={errors.lastName}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Jinsi (familiya oxiriga qarab avtomatik)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, gender: 'male' }))}
            className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
              form.gender === 'male'
                ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm anim-pop'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            👦 O'g'il bola (-v)
          </button>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, gender: 'female' }))}
            className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
              form.gender === 'female'
                ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm anim-pop'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            👧 Qiz bola (-a)
          </button>
        </div>
      </div>

      <Input
        label="Sinf"
        value={form.classId}
        onChange={(e) => handle('classId', e.target.value)}
        placeholder="9-A"
      />

      <UzPhoneInput
        label="Telefon (o'zi) *"
        value={form.phone}
        onChange={(v) => handle('phone', v)}
        error={errors.phone}
        required
      />

      <UzPhoneInput
        label="Onasining telefoni *"
        value={form.motherPhone}
        onChange={(v) => handle('motherPhone', v)}
        error={errors.motherPhone}
        required
      />

      <UzPhoneInput
        label="Otasining telefoni (ixtiyoriy)"
        value={form.fatherPhone}
        onChange={(v) => handle('fatherPhone', v)}
        error={errors.fatherPhone}
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
