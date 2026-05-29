import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [acting, setActing]           = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals');
      setWithdrawals(data.withdrawals);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await api.patch(`/admin/withdrawals/${id}/approve`);
      toast.success('Withdrawal approved!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setActing(null); }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await api.patch(`/admin/withdrawals/${id}/reject`, { adminNote: 'Rejected by admin' });
      toast.success('Withdrawal rejected');
      fetchData();
    } catch { toast.error('Failed'); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Withdrawal Requests</h1>
        <p className="page-subtitle">Review and process pending withdrawal requests</p>
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
                  <th>Account</th>
                  <th>IFSC</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="icon">✅</div>
                        <p>No pending withdrawals</p>
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
                    <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{w.account_number}</span></td>
                    <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{w.ifsc_code}</span></td>
                    <td className="text-slate-400">{format(new Date(w.requested_at), 'dd MMM yy')}</td>
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
