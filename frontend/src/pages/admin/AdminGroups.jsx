import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    try { const { data } = await api.get('/admin/groups'); setGroups(data.groups); }
    catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/groups', { name: groupName });
      toast.success('Group created!');
      setGroupName('');
      fetchGroups();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Groups</h1>
        <p className="page-subtitle">Manage member groups for lucky draws</p>
      </div>

      <form onSubmit={handleCreate} className="card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Group Name</label>
          <input className="input" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Group A — Jan 2026" required />
        </div>
        <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">{creating ? 'Creating…' : 'Create Group'}</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="col-span-full text-center text-gray-500 py-8">Loading...</p>
        : groups.map(g => {
          const pct = Math.min((g.memberCount / g.max_members) * 100, 100);
          return (
            <div key={g.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{g.name}</h3>
                  <p className="text-xs text-slate-400">{format(new Date(g.created_at), 'dd MMM yyyy')}</p>
                </div>
                <span className={`badge ${g.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{g.status}</span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between"><span className="text-slate-500">Members</span><span className="font-bold text-slate-800">{g.memberCount} / {g.max_members}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-bold text-slate-800">{g.cycle_months} months</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Monthly</span><span className="font-bold text-slate-800">₹{parseFloat(g.monthly_amount).toLocaleString('en-IN')}</span></div>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar bg-red-600" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{Math.floor(pct)}% capacity</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
