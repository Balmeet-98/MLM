import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TIERS      = ['booking', 'mid', 'deluxe', 'double_id'];
const CATEGORIES = ['appliance', 'furniture', 'electronics', 'vehicle', 'other'];

const TIER_BADGE = {
  booking:   'badge badge-blue',
  mid:       'badge badge-green',
  deluxe:    'badge badge-purple',
  double_id: 'badge badge-yellow',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', tier: 'booking', category: 'appliance' });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/products', form);
      toast.success('Product created!');
      setShowForm(false);
      setForm({ name: '', price: '', tier: 'booking', category: 'appliance' });
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (product) => {
    try {
      await api.patch(`/admin/products/${product.id}`, { ...product, isActive: !product.is_active });
      toast.success(product.is_active ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products across 4 tiers</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          {showForm ? '✕ Close' : '+ Add Product'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border border-amber-100 bg-amber-50/60">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹) *</label>
              <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tier *</label>
              <select className="input" value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                {TIERS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : 'Save Product'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card-flat">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Tier</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="icon">📦</div>
                        <p>No products yet</p>
                      </div>
                    </td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-800">{p.name}</td>
                    <td className="font-bold text-brand-600">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td><span className={TIER_BADGE[p.tier] || 'badge badge-gray'}>{p.tier?.replace('_', ' ')}</span></td>
                    <td className="capitalize text-slate-500">{p.category}</td>
                    <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`text-xs font-semibold hover:underline ${p.is_active ? 'text-red-600' : 'text-emerald-600'}`}
                      >
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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
