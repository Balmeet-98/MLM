import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/rewards/pending');
      setRewards((data.rewards || []).filter((r) => r.reward_type !== 'lucky_draw'));
    }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCollected = async (id) => {
    setMarking(id);
    try {
      await api.patch(`/admin/rewards/${id}/mark-collected`);
      toast.success('Marked as collected!');
      fetchData();
    } catch { toast.error('Failed'); }
    finally { setMarking(null); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Reward Pickups</h1>
        <p className="page-subtitle">Pending reward collections requiring ID verification</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <span className="flex-shrink-0">⚠️</span>
        Verify government-issued ID proof before marking as collected. All vehicles are base models only. No cash alternatives.
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : rewards.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">✅</div>
          <p className="text-slate-500">No pending reward pickups</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map(r => (
            <div key={r.id} className="card border border-amber-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{r.reward_name}</p>
                  <p className="text-xs text-slate-400 capitalize mb-3">{r.reward_type?.replace('_', ' ')}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-slate-400">Member</span></div>
                    <div className="font-semibold text-slate-800">{r.users?.name}</div>
                    <div><span className="text-slate-400">Phone</span></div>
                    <div>{r.users?.phone}</div>
                    <div><span className="text-slate-400">Email</span></div>
                    <div className="truncate">{r.users?.email}</div>
                    <div><span className="text-slate-400">Ref Code</span></div>
                    <div><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.users?.referral_code}</span></div>
                    <div><span className="text-slate-400">Achieved</span></div>
                    <div className="text-slate-500">{format(new Date(r.achieved_at), 'dd MMM yyyy')}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCollected(r.id)}
                  disabled={marking === r.id}
                  className="btn-primary flex-shrink-0"
                >
                  {marking === r.id ? '…' : '✓ Mark Collected'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
