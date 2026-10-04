import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import Card from '../components/ui/Card';

export default function Terms() {
  usePageTitle('Foydalanish shartlari');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-white mb-4 hover:underline"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>

        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📋</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Foydalanish shartlari
            </h1>
            <p className="text-gray-500 text-sm">Maktab Boshqaruv Tizimi</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-4 text-sm text-slate-700">
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                1. Umumiy ma'lumot
              </h2>
              <p>
                Ushbu tizim <strong>9-A sinf</strong> o'quvchilari va ularning
                ota-onalari uchun mo'ljallangan. Tizimga ro'yxatdan o'tish orqali
                siz quyidagi shartlarga rozilik bildirasiz.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                2. Ma'lumotlar yig'ilishi
              </h2>
              <p>
                Tizim sizning <strong>eMaktab login va parolingizni</strong> qabul
                qiladi va ular orqali:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>O'quvchi ismi va familiyasini oladi</li>
                <li>Sinf ma'lumotlarini oladi</li>
                <li>Baholarni avtomatik yangilaydi</li>
                <li>Dars jadvalini oladi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                3. Xavfsizlik
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Login-parolingiz <strong>AES-256</strong> bilan shifrlanadi
                </li>
                <li>Ma'lumotlar <strong>Firebase Firestore</strong>da xavfsiz saqlanadi</li>
                <li>Uchinchi shaxslarga ma'lumot <strong>berilmaydi</strong></li>
                <li>Siz istalgan vaqtda ma'lumotlaringizni <strong>o'chirishni</strong> so'rashingiz mumkin</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                4. Avtomatik kirish
              </h2>
              <p>
                Tizim sizning hisobingiz orqali <strong>eMaktab.uz</strong> saytiga
                avtomatik kiradi. Bu:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Faqat ma'lumot olish uchun</li>
                <li>Hech qanday o'zgartirish kiritilmaydi</li>
                <li>eMaktab qoidalariga rioya qilinadi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                5. Sizning huquqlaringiz
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ma'lumotlaringizni <strong>ko'rish</strong></li>
                <li>Ma'lumotlaringizni <strong>o'chirish</strong>ni so'rash</li>
                <li>Telefon raqamlarni <strong>o'zgartirish</strong></li>
                <li>Tizimdan <strong>chiqish</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">
                6. Ota-onalar uchun
              </h2>
              <p>
                Ota-ona telefon raqamini kiritish orqali:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Farzandning baholari haqida xabar oladi</li>
                <li>Sinf e'lonlarini oladi</li>
                <li>Reytingda qatnashadi</li>
              </ul>
            </section>

            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mt-6">
              <p className="text-sm text-emerald-800">
                <strong>✅ Rozilik:</strong> Tizimga ro'yxatdan o'tish orqali siz
                yuqoridagi barcha shartlarga rozilik bildirasiz.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/register"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Tushundim, orqaga
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}