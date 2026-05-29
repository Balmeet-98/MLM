import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import ContactInfo, { CONTACT } from '../brand/ContactInfo';

export default function Layout({ adminOnly = false }) {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar (always visible ≥ lg) */}
      <div className="sidebar-wrap hidden lg:flex lg:flex-col">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile sidebar (drawer) */}
      <div className={`sidebar-mobile lg:hidden ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-wrap flex flex-col" style={{ width: '100%' }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Right side */}
      <div className="main-wrap">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb placeholder / page title area */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
              <span className="text-xs text-slate-400 mt-0.5">{user?.role === 'admin' ? 'Administrator' : user?.referralCode}</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-800 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p className="m-0 mb-1 font-medium text-slate-600">Samriddhi Network · {CONTACT.address}</p>
          <ContactInfo variant="inline" className="justify-center text-xs" />
        </footer>
      </div>
    </div>
  );
}
