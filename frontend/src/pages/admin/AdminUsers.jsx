import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search: q || undefined, limit: 50 } });
      setUsers(data.users);
      setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (user) => {
    setActing(user.id);
    try {
      const endpoint = user.is_active ? `/admin/users/${user.id}/block` : `/admin/users/${user.id}/unblock`;
      await api.patch(endpoint);
      toast.success(`${user.name} ${user.is_active ? 'blocked' : 'unblocked'}`);
      fetchUsers(search);
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{total} total registered users</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1 max-w-sm"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers(search)}
        />
        <button onClick={() => fetchUsers(search)} className="btn-primary">Search</button>
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
                  <th>Ref Code</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Missed</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400">No users found</td></tr>
                ) : users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{user.referral_code}</span></td>
                    <td className="capitalize text-slate-600">{user.position || '—'}</td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`font-bold text-sm ${(user.consecutive_missed_installments || 0) >= 3 ? 'text-red-600' : 'text-slate-500'}`}>
                        {user.consecutive_missed_installments || 0}
                      </span>
                    </td>
                    <td className="text-slate-400">{format(new Date(user.created_at), 'dd MMM yy')}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/users/${user.id}/tree`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Tree
                        </Link>
                        <button
                          onClick={() => toggleBlock(user)}
                          disabled={acting === user.id}
                          className={`text-xs font-semibold hover:underline ${user.is_active ? 'text-red-600' : 'text-emerald-600'}`}
                        >
                          {acting === user.id ? '…' : user.is_active ? 'Block' : 'Unblock'}
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
