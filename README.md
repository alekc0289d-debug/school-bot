# Maktab tizimi — admin panel (React + Vite + Firebase)

## Ishga tushirish

    npm install
    cp .env.example .env     # Firebase kalitlari va VITE_API_URL
    npm run dev

## Kirish (admin)

Panelga faqat `users/{uid}` hujjatida `role: "admin"` bo'lgan akkaunt kira oladi
(Firebase Auth'dagi UID ni Firestore `users` kolleksiyasida yarating).

## Firestore qoidalari

`firestore.rules` faylini Firebase Console -> Firestore -> Rules ga joylang
(yoki `firebase deploy --only firestore:rules`).

## Netlify

Environment variables'ga `.env.example` dagi hamma `VITE_*` o'zgaruvchilarni qo'shing.
`VITE_API_URL` — deploy qilingan Python API manzili (https bilan).
