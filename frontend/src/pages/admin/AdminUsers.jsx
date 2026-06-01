import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  sponsorId: '',
  parentUserId: '',
};

function MemberSelect({ label, value, onChange, options, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <select
        className="input w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={label.includes('Sponsor')}
      >
        <option value="">Select member…</option>
        {options.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.referral_code}){!u.is_active ? ' — inactive' : ''}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [parentTouched, setParentTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: {
          search: q || undefined,
          status: statusFilter === 'active' || statusFilter === 'inactive' ? statusFilter : undefined,
          limit: 50,
        },
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberOptions = async () => {
    try {
      const { data } = await api.get('/admin/users/options');
      setMemberOptions(data.users || []);
    } catch {
      toast.error('Failed to load member list');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const openAddModal = () => {
    setForm(emptyForm);
    setParentTouched(false);
    setCreatedUser(null);
    setShowAdd(true);
    loadMemberOptions();
  };

  const closeAddModal = () => {
    setShowAdd(false);
    setForm(emptyForm);
    setCreatedUser(null);
  };

  const setSponsorId = (sponsorId) => {
    setForm((prev) => ({
      ...prev,
      sponsorId,
      parentUserId: parentTouched ? prev.parentUserId : sponsorId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/users', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        sponsorId: form.sponsorId,
        parentUserId: form.parentUserId || form.sponsorId,
        markActivationPaid: true,
      });
      toast.success('Member created');
      setCreatedUser(data.user);
      fetchUsers(search);
      loadMemberOptions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlock = async (user) => {
    setActing(user.id);
    try {
      const endpoint = user.is_active ? `/admin/users/${user.id}/block` : `/admin/users/${user.id}/unblock`;
      await api.patch(endpoint);
      toast.success(`${user.name} ${user.is_active ? 'blocked' : 'unblocked'}`);
      fetchUsers(search);
    } catch {
      toast.error('Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">
            {total} {statusFilter === 'active' ? 'active' : statusFilter === 'inactive' ? 'inactive' : ''} members
          </p>
        </div>
        <button type="button" onClick={openAddModal} className="btn-primary">
          Add member
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1 max-w-sm"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search)}
        />
        <button onClick={() => fetchUsers(search)} className="btn-primary">
          Search
        </button>
      </div>

      <div className="card-flat">
        {loading ? (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Ref Code</th>
                  <th>Status</th>
                  <th>Missed</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {user.referral_code}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`font-bold text-sm ${
                            (user.consecutive_missed_installments || 0) >= 3
                              ? 'text-red-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {user.consecutive_missed_installments || 0}
                        </span>
                      </td>
                      <td className="text-slate-400">
                        {format(new Date(user.created_at), 'dd MMM yy')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/users/${user.id}/tree`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Tree
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleBlock(user)}
                            disabled={acting === user.id}
                            className={`text-xs font-semibold hover:underline ${
                              user.is_active ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {acting === user.id ? '…' : user.is_active ? 'Block' : 'Unblock'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add member</h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {createdUser ? (
              <div className="p-6 space-y-4">
                <p className="text-emerald-700 font-semibold">Member created successfully.</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                  <p>
                    <span className="text-slate-500">Name:</span> {createdUser.name}
                  </p>
                  <p>
                    <span className="text-slate-500">Email:</span> {createdUser.email}
                  </p>
                  <p>
                    <span className="text-slate-500">Referral code:</span>{' '}
                    <span className="font-mono font-bold">{createdUser.referralCode}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/users/${createdUser.id}/tree`}
                    className="btn-primary flex-1 text-center"
                    onClick={closeAddModal}
                  >
                    View tree
                  </Link>
                  <button type="button" onClick={closeAddModal} className="btn-secondary flex-1">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full name</label>
                  <input
                    className="input w-full"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    className="input w-full"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    className="input w-full"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>

                <MemberSelect
                  label="Sponsor (referral)"
                  value={form.sponsorId}
                  onChange={setSponsorId}
                  options={memberOptions}
                />

                <MemberSelect
                  label="Place in tree under"
                  value={form.parentUserId || form.sponsorId}
                  onChange={(parentUserId) => {
                    setParentTouched(true);
                    setForm((prev) => ({ ...prev, parentUserId }));
                  }}
                  options={memberOptions}
                  hint="Defaults to sponsor. Choose another member for manual placement."
                />

                <p className="text-xs text-slate-500">
                  Activation (₹1,200) is recorded as admin manual payment. Month 1 installment is marked paid.
                </p>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={closeAddModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Creating…' : 'Create member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
