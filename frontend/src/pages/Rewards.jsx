import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import RankBadge from '../components/dashboard/RankBadge';
import toast from 'react-hot-toast';

export default function Rewards() {
  const [data, setData]     = useState({ rewards: [], totalPairs: 0, ranksProgress: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('ranks');

  useEffect(() => {
    api.get('/rewards')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load rewards'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const { rewards, totalPairs, ranksProgress } = data;
  const achievedCount = ranksProgress.filter(r => r.achieved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Rewards & Ranks</h1>
          <p className="page-subtitle">
            <strong>{totalPairs.toLocaleString()}</strong> total pairs &nbsp;·&nbsp;
            <strong>{achievedCount}</strong> ranks achieved
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: 'ranks',  label: 'Rank Progress' },
          { key: 'earned', label: 'Earned Rewards' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Rank Progress */}
      {tab === 'ranks' && (
        <div className="space-y-3">
          {ranksProgress.map(rank => {
            const pct = Math.min((totalPairs / rank.pairs_required) * 100, 100);
            return (
              <div
                key={rank.id}
                className={`card border-2 transition-all ${
                  rank.achieved ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <RankBadge rank={rank.name} />
                      {rank.achieved && (
                        <span className="text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full">✓ Achieved</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      Reward: <strong className="text-slate-800">{rank.reward_name}</strong>
                    </p>
                    {rank.monthly_income > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        + ₹{rank.monthly_income.toLocaleString('en-IN')}/month for {rank.income_duration_months} months
                      </p>
                    )}
                    {rank.achieved && rank.achievedAt && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Achieved: {format(new Date(rank.achievedAt), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
                      {rank.pairs_required.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">pairs required</p>
                  </div>
                </div>
                <div className="progress-wrap">
                  <div
                    className={`progress-bar ${rank.achieved ? 'bg-emerald-500' : 'bg-red-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {totalPairs.toLocaleString()} / {rank.pairs_required.toLocaleString()} pairs ({Math.floor(pct)}%)
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Earned Rewards */}
      {tab === 'earned' && (
        <div className="space-y-3">
          {rewards.length === 0 ? (
            <div className="empty-state card">
              <div className="icon">🎁</div>
              <p className="text-slate-500">No rewards earned yet. Keep building your team!</p>
            </div>
          ) : rewards.map(reward => (
            <div
              key={reward.id}
              className={`card border-2 flex flex-wrap items-center justify-between gap-3 ${
                reward.status === 'collected'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-amber-200 bg-amber-50/50'
              }`}
            >
              <div>
                <p className="font-bold text-slate-800">{reward.reward_name}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {reward.reward_type?.replace('_', ' ')} &nbsp;·&nbsp;
                  {format(new Date(reward.achieved_at), 'dd MMM yyyy')}
                </p>
                {reward.status === 'pending_collection' && (
                  <p className="text-xs text-amber-700 mt-1">⚠️ Visit office with valid ID proof to collect</p>
                )}
              </div>
              <span className={`badge flex-shrink-0 ${reward.status === 'collected' ? 'badge-green' : 'badge-yellow'}`}>
                {reward.status === 'collected' ? '✓ Collected' : 'Pending Pickup'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
