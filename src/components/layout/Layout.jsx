import { Component, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="frost-card rounded-2xl p-6 border border-red-200 bg-red-50/90 text-red-900">
          <h2 className="text-lg font-bold mb-2">⚠️ Sahifada xatolik yuz berdi</h2>
          <p className="text-sm font-mono bg-white p-3 rounded-xl border border-red-200 break-all">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageErrorBoundary>
          <Header setSidebarOpen={setSidebarOpen} />
        </PageErrorBoundary>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <PageErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-slate-500 text-sm font-medium">❄️ Yuklanmoqda...</p>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
