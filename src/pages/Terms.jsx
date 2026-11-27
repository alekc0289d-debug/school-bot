import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import Card from '../components/ui/Card';

export default function Terms() {
  usePageTitle('Foydalanish shartlari');

  return (
    <div className="min-h-screen winter-aurora flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl animate-slide-up">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-white mb-4 hover:underline text-sm font-medium"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>

        <Card className="p-8">
          <div className="text-center mb-6 anim-stagger-1">
            <div className="text-5xl mb-3 animate-float-slow">❄️📋</div>
            <h1 className="text-2xl font-extrabold text-slate-800 mb-1">
              Foydalanish shartlari va Oylik to'lov
            </h1>
            <p className="text-slate-500 text-sm">
              Maktab Boshqaruv Tizimi · 9-A sinf
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed anim-stagger-2">
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-1.5">
                1. Umumiy ma'lumot
              </h2>
              <p>
                Ushbu tizim <strong>9-A sinf</strong> o'quvchilari va ularning
                ota-onalari uchun mo'ljallangan. Ro'yxatdan o'tish orqali siz
                quyidagi shartlarga rozilik bildirasiz.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-1.5">
                2. Ma'lumotlar yig'ilishi
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>O'quvchi ismi, familiyasi va jinsi (familiya oxiriga qarab)</li>
                <li>eMaktab'dagi kunlik, BSB va CHSB baholari hamda dars jadvali</li>
                <li>Botdagi testlar, topshiriqlar va guruh viktorinasi ballari</li>
              </ul>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h2 className="text-base font-bold text-amber-900 mb-1.5">
                3. Oylik to'lov — 2 000 so'm va Pul mukofoti fondi
              </h2>
              <p className="text-amber-900/90">
                Platformaning 24/7 ishlashi hamda o'quvchilarni rag'batlantirish uchun
                har bir o'quvchidan oyiga <strong>2 000 so'm</strong> miqdorida to'lov olinadi:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-amber-900/90">
                <li>
                  <strong>Server va AI xarajatlari:</strong> Railway, Firebase va Groq AI o'qituvchi xizmati.
                </li>
                <li>
                  <strong>Pul mukofoti jamg'armasi:</strong> Oy oxirida reyting g'olibiga{' '}
                  <strong>Pul mukofoti 💰</strong> beriladi.
                </li>
                <li>
                  <strong>Ixtiyoriylik:</strong> To'lov shartiga o'z roziligingiz bilan qo'shilasiz,
                  xohlagan vaqtda tizimdan chiqishingiz mumkin.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-1.5">
                4. Xavfsizlik
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  eMaktab login-parolingiz <strong>AES-256</strong> bilan shifrlanadi.
                </li>
                <li>Uchinchi shaxslarga hech qanday ma'lumot berilmaydi.</li>
                <li>
                  Favqulodda holatlarda administrator faqat sabab ko'rsatgan holda
                  (audit log orqali) kirish ma'lumotini ko'rishi mumkin.
                </li>
              </ul>
            </section>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <strong>✅ Rozilik:</strong> Ro'yxatdan o'tish orqali siz barcha shartlarga
                va oylik <strong>2 000 so'm</strong> to'lovga to'liq rozilik bildirasiz.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/register"
              className="btn-ice-shimmer px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Tushundim, orqaga
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
