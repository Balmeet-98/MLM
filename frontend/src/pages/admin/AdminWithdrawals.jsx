import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const statusBadge = {
  approved: 'badge badge-green',
  rejected: 'badge badge-red',
  pending: 'badge badge-yellow',
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [acting, setActing]           = useState(null);
  const [activeTab, setActiveTab]     = useState('pending');

  const fetchData = async (status = activeTab) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/withdrawals', { params: { status } });
      setWithdrawals(data.withdrawals);
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await api.patch(`/admin/withdrawals/${id}/approve`);
      toast.success('Withdrawal approved!');
      fetchData(activeTab);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setActing(null); }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await api.patch(`/admin/withdrawals/${id}/reject`, { adminNote: 'Rejected by admin' });
      toast.success('Withdrawal rejected');
      fetchData(activeTab);
    } catch { toast.error('Failed'); }
    finally { setActing(null); }
  };

  const isPendingTab = activeTab === 'pending';
  const emptyMessage = {
    pending: 'No pending withdrawals',
    approved: 'No approved withdrawals',
    rejected: 'No rejected withdrawals',
    all: 'No withdrawals found',
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Withdrawals</h1>
        <p className="page-subtitle">Review pending requests and view withdrawal history</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-flat">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  {isPendingTab && <th>Account</th>}
                  {isPendingTab && <th>IFSC</th>}
                  <th>Requested</th>
                  {!isPendingTab && <th>Processed</th>}
                  {!isPendingTab && <th>Status</th>}
                  {!isPendingTab && <th>Note</th>}
                  {isPendingTab && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={isPendingTab ? 7 : 8}>
                      <div className="empty-state">
                        <div className="icon">✅</div>
                        <p>{emptyMessage[activeTab]}</p>
                      </div>
                    </td>
                  </tr>
                ) : withdrawals.map(w => (
                  <tr key={w.id}>
                    <td>
                      <p className="font-semibold text-slate-800">{w.users?.name}</p>
                      <p className="text-xs text-slate-400">{w.users?.phone}</p>
                    </td>
                    <td className="font-black text-brand-600 text-base">
                      ₹{parseFloat(w.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="text-slate-600">{w.bank_name}</td>
                    {isPendingTab && (
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{w.account_number}</span></td>
                    )}
                    {isPendingTab && (
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{w.ifsc_code}</span></td>
                    )}
                    <td className="text-slate-400">{format(new Date(w.requested_at), 'dd MMM yy')}</td>
                    {!isPendingTab && (
                      <td className="text-slate-400">
                        {w.processed_at ? format(new Date(w.processed_at), 'dd MMM yy') : '—'}
                      </td>
                    )}
                    {!isPendingTab && (
                      <td><span className={statusBadge[w.status] || 'badge badge-gray'}>{w.status}</span></td>
                    )}
                    {!isPendingTab && (
                      <td className="text-slate-500 text-sm max-w-[180px] truncate">{w.admin_note || '—'}</td>
                    )}
                    {isPendingTab && (
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(w.id)}
                            disabled={acting === w.id}
                            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {acting === w.id ? '…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(w.id)}
                            disabled={acting === w.id}
                            className="text-xs font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {acting === w.id ? '…' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
