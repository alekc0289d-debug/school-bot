import { lazy, Suspense, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ROLES } from './constants/roles';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/Register'));
const Terms = lazy(() => import('./pages/Terms'));
const Layout = lazy(() => import('./components/layout/Layout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Students = lazy(() => import('./pages/admin/Students'));
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'));
const Grades = lazy(() => import('./pages/admin/Grades'));
const Schedule = lazy(() => import('./pages/admin/Schedule'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const CaptchaQueue = lazy(() => import('./pages/admin/CaptchaQueue'));
const SyncLog = lazy(() => import('./pages/admin/SyncLog'));
const Rating = lazy(() => import('./pages/admin/Rating'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function NoAccess({ onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-8 max-w-md text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mx-auto mb-4">
          🔒
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Ruxsat yo'q</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Bu akkaunt administrator emas. Firestore'da{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">users/&#123;uid&#125;</code>{' '}
          hujjatida <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">role: "admin"</code>{' '}
          bo'lishi kerak. Agar hali birorta ham admin yaratilmagan bo'lsa, birinchi kirgan
          kishi avtomatik admin bo'ladi — sahifani yangilab ko'ring.
        </p>
        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition"
        >
          Chiqish
        </button>
      </div>
    </div>
  );
}

const ProtectedRoute = memo(function ProtectedRoute({ children }) {
  const { user, role, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== ROLES.ADMIN) return <NoAccess onLogout={logout} />;
  return children;
});

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/captcha" element={<CaptchaQueue />} />
          <Route path="/sync" element={<SyncLog />} />
          <Route path="/rating" element={<Rating />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}