import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRIORITY_BADGE = {
  urgent: 'bg-red-600 text-white',
  high: 'bg-amber-500 text-white',
  medium: 'bg-blue-500 text-white',
  info: 'bg-slate-200 text-slate-700',
};

export default function AdminPairs() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchPairs = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pairs', { params: { search: q || undefined, limit: 80 } });
      setMembers(data.members || []);
    } catch {
      toast.error('Failed to load pair data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header mb-0">
        <h1 className="page-title">Pair insights</h1>
        <p className="page-subtitle">Live pair counts and growth alerts for every member</p>
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1 max-w-sm"
          placeholder="Search member…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPairs(search)}
        />
        <button type="button" onClick={() => fetchPairs(search)} className="btn-primary">
          Search
        </button>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : (
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No members found</p>
          ) : (
            members.map((m) => (
              <div key={m.userId} className="card-flat overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === m.userId ? null : m.userId)}
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.referralCode}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-purple-700">{m.totalPairs}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">pairs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{m.activeLegCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">active legs</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-semibold text-slate-600">
                      {m.leftCount} / {m.rightCount}
                    </p>
                    <p className="text-[10px] text-slate-500">leg 1 / leg 2 vol</p>
                  </div>
                  {m.topAlert && (
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        PRIORITY_BADGE[m.topAlert.priority] || PRIORITY_BADGE.info
                      }`}
                    >
                      {m.topAlert.title}
                    </span>
                  )}
                  <span className="text-slate-400 text-sm">{expanded === m.userId ? '▲' : '▼'}</span>
                </button>

                {expanded === m.userId && (
                  <div className="px-5 pb-5 border-t border-slate-100 space-y-3">
                    {m.nextRank && (
                      <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                        Next rank: <strong>{m.nextRank.name}</strong> — {m.nextRank.pairsRemaining} pairs to go (
                        {m.nextRank.rewardName})
                      </p>
                    )}
                    {Array.isArray(m.legCounts) && m.legCounts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.legCounts.map((leg, i) => (
                          <span
                            key={leg.childId || i}
                            className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg"
                          >
                            Leg {i + 1}: {leg.count} members
                          </span>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-2">
                      {m.notifications?.map((n, i) => (
                        <li key={i} className="text-sm text-slate-700 border-l-4 border-red-300 pl-3 py-1">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-slate-500"> — {n.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
