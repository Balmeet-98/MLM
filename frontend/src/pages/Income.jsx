import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

const TYPES = [
  { key: '',             label: 'All' },
  { key: 'direct',      label: 'Direct' },
  { key: 'pair',        label: 'Pair' },
  { key: 'installment', label: 'Installment' },
  { key: 'rank',        label: 'Rank Income' },
];

const TYPE_BADGE = {
  direct:      'badge badge-blue',
  pair:        'badge badge-purple',
  installment: 'badge badge-green',
  rank:        'badge badge-yellow',
};

export default function Income() {
  const [logs, setLogs]   = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchLogs = async (type = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/wallet/income', {
        params: { type: type || undefined, limit: 50 },
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch { toast.error('Failed to load income logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(filter); }, [filter]);

  const totalEarned = logs.reduce((s, l) => s + parseFloat(l.amount), 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Income Logs</h1>
        <p className="page-subtitle">Your complete earnings history</p>
      </div>

      {/* Filter + summary */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              filter === key
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {totalEarned > 0 && (
            <span className="text-sm font-bold text-emerald-600">
              +₹{totalEarned.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-xs text-slate-400">{total} entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="card-flat">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💰</div>
            <p>No income records found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>From</th>
                  <th>Level</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={TYPE_BADGE[log.income_type] || 'badge badge-gray'}>
                        {TYPES.find(t => t.key === log.income_type)?.label || log.income_type}
                      </span>
                    </td>
                    <td className="font-bold text-emerald-600">
                      +₹{parseFloat(log.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="text-slate-600">{log.from_user?.name || '—'}</td>
                    <td className="text-slate-400">{log.level ? `L${log.level}` : '—'}</td>
                    <td className="text-slate-400">{format(new Date(log.created_at), 'dd MMM yy')}</td>
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
