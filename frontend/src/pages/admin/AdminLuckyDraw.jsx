import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLuckyDraw() {
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [monthNumber, setMonthNumber] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/admin/groups').then(r => setGroups(r.data.groups));
    api.get('/admin/lucky-draw/history').then(r => setHistory(r.data.draws));
  }, []);

  const handleDraw = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !monthNumber) return;
    setRunning(true);
    setResult(null);
    try {
      const { data } = await api.post(`/admin/lucky-draw/${selectedGroup}`, { monthNumber: parseInt(monthNumber) });
      setResult(data);
      toast.success(`Draw complete! ${data.winners?.length} winner(s) selected`);
      const r = await api.get('/admin/lucky-draw/history');
      setHistory(r.data.draws);
    } catch (err) { toast.error(err.response?.data?.error || 'Draw failed'); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Lucky Draw</h1>
        <p className="page-subtitle">Run monthly lucky draws for eligible members</p>
      </div>

      {/* Draw Form */}
      <div className="card border border-amber-100 bg-amber-50/60">
        <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>🎰 Run Lucky Draw</h2>
        <form onSubmit={handleDraw} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">Select Group</label>
            <select className="input mt-1" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} required>
              <option value="">Choose group...</option>
              {groups.filter(g => g.status === 'active').map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.memberCount} members)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Month Number (1–16)</label>
            <input type="number" min={1} max={17} className="input mt-1 w-32" value={monthNumber} onChange={e => setMonthNumber(e.target.value)} required placeholder="e.g. 3" />
          </div>
          <button type="submit" disabled={running} className="btn-primary whitespace-nowrap">
            {running ? '🎲 Drawing...' : '🎰 Run Draw'}
          </button>
        </form>

        <div className="mt-3 text-xs text-yellow-700 space-y-0.5">
          <p>• Only members with 100% installments paid up to that month are eligible</p>
          <p>• Month 16 draws 24 winners (7 AC + 7 TV + 10 Bikes)</p>
          <p>• Rewards are automatically assigned to winners</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card border-2 border-green-400 bg-green-50">
          <h3 className="font-bold text-green-800 mb-3">🏆 Draw Results ({result.eligibleCount} eligible)</h3>
          <div className="space-y-2">
            {result.winners?.map((w, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-bold">{w.winner.name}</p>
                  <p className="text-xs text-gray-500">Won: <strong>{w.reward}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="card-flat">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>Draw History</h2>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎰</div>
            <p>No draws conducted yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map(d => (
              <div key={d.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{d.users?.name}</p>
                  <p className="text-xs text-slate-400">Month {d.month_number} &nbsp;·&nbsp; {d.reward_catalog?.reward_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">{format(new Date(d.drawn_at), 'dd MMM yyyy')}</p>
                  <span className={`badge ${d.status === 'collected' ? 'badge-green' : 'badge-yellow'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
