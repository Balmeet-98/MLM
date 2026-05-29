import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TYPES = [
  { key: '',             label: 'All' },
  { key: 'direct',      label: 'Direct' },
  { key: 'pair',        label: 'Pair' },
  { key: 'installment', label: 'Installment' },
  { key: 'rank',        label: 'Rank' },
];

const TYPE_BADGE = {
  direct:      'badge badge-blue',
  pair:        'badge badge-purple',
  installment: 'badge badge-green',
  rank:        'badge badge-yellow',
};

export default function AdminIncome() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [total, setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/income-logs', { params: { type: filter || undefined, limit: 100 } })
      .then(res => { setLogs(res.data.logs); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Income Monitor</h1>
        <p className="page-subtitle">All income transactions across the network</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              filter === key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{total} records</span>
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
                  <th>Type</th>
                  <th>Amount</th>
                  <th>From</th>
                  <th>Level</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="icon">📊</div>
                        <p>No income logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <p className="font-semibold text-slate-800">{log.users?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{log.users?.referral_code}</p>
                    </td>
                    <td>
                      <span className={TYPE_BADGE[log.income_type] || 'badge badge-gray'}>
                        {log.income_type}
                      </span>
                    </td>
                    <td className="font-bold text-emerald-600">+₹{parseFloat(log.amount).toLocaleString('en-IN')}</td>
                    <td className="text-slate-600">{log.from_user?.name || '—'}</td>
                    <td className="text-slate-400">{log.level ? `L${log.level}` : '—'}</td>
                    <td className="text-slate-400 whitespace-nowrap">{format(new Date(log.created_at), 'dd MMM yy, hh:mm a')}</td>
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
