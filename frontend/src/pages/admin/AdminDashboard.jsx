import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import toast from 'react-hot-toast';

const actions = [
  { to: '/admin/users',       icon: '👥', label: 'Manage Members',  bg: 'bg-blue-50',   hover: 'hover:bg-blue-100' },
  { to: '/admin/withdrawals', icon: '💸', label: 'Withdrawals',     bg: 'bg-red-50',    hover: 'hover:bg-red-100' },
  { to: '/admin/lucky-draw',  icon: '🎰', label: 'Lucky Draw',      bg: 'bg-purple-50', hover: 'hover:bg-purple-100' },
  { to: '/admin/rewards',     icon: '🎁', label: 'Reward Pickup',   bg: 'bg-amber-50',  hover: 'hover:bg-amber-100' },
  { to: '/admin/products',    icon: '📦', label: 'Products',        bg: 'bg-green-50',  hover: 'hover:bg-green-100' },
  { to: '/admin/groups',      icon: '🗂️', label: 'Groups',          bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100' },
  { to: '/admin/income',      icon: '📈', label: 'Income Logs',     bg: 'bg-teal-50',   hover: 'hover:bg-teal-100' },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Network overview and management</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members"       value={loading ? '…' : (stats?.totalUsers ?? 0)}         icon="👥" color="blue"   />
        <StatCard title="Active Members"      value={loading ? '…' : (stats?.activeUsers ?? 0)}        icon="✅" color="green"  />
        <StatCard title="Pending Withdrawals" value={loading ? '…' : (stats?.pendingWithdrawals ?? 0)} icon="💸" color="red"    />
        <StatCard title="Pending Rewards"     value={loading ? '…' : (stats?.pendingRewards ?? 0)}     icon="🎁" color="yellow" />
      </div>

      {/* Total income paid highlight */}
      {stats?.totalIncomePaid > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Total Income Distributed</p>
          <p className="text-4xl font-black text-white mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            ₹{stats.totalIncomePaid.toLocaleString('en-IN')}
          </p>
          <p className="text-emerald-200 text-xs mt-1">Paid out to all members</p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map(({ to, icon, label, bg, hover }) => (
            <Link
              key={to}
              to={to}
              className={`${bg} ${hover} rounded-xl p-4 flex flex-col items-center gap-2.5 text-center transition-colors group`}
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
