import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TIERS = [
  { key: 'booking',   label: 'Booking',   desc: 'Choose ONE to activate your account',         rule: 'Required to activate' },
  { key: 'mid',       label: 'Mid',       desc: 'Choose 1 Mid + 1 Deluxe after qualifying',    rule: '1 Mid + 1 Deluxe' },
  { key: 'deluxe',    label: 'Deluxe',    desc: 'Choose any THREE after qualifying',            rule: 'Any 3 products' },
  { key: 'double_id', label: 'Double ID', desc: 'Available for dual membership holders only',  rule: 'Dual membership' },
];

const CATEGORY_ICON = {
  appliance:   '🏠',
  electronics: '📺',
  vehicle:     '🏍️',
  furniture:   '🪑',
  other:       '📦',
};

export default function ProductSelect() {
  const [products, setProducts]     = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [activeTier, setActiveTier] = useState('booking');
  const [loading, setLoading]       = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const reload = () =>
    Promise.all([api.get('/products'), api.get('/products/my')])
      .then(([p, mp]) => { setProducts(p.data.products); setMyProducts(mp.data.products); })
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const hasBookingProduct = myProducts.some(p => p.selection_stage === 'booking');

  const handlePurchase = async (productId) => {
    setPurchasing(productId);
    try {
      const { data } = await api.post('/products/purchase', { productId });
      if (data.activated) {
        toast.success('Account activated! Welcome to Samriddhi Network!');
        updateUser({ isActive: true });
        navigate('/dashboard');
      } else {
        toast.success(data.message);
        reload();
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setPurchasing(null); }
  };

  const tierProducts = products.filter(p => p.tier === activeTier);
  const selectedIds  = new Set(myProducts.map(p => p.product_id));

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const activeTierInfo = TIERS.find(t => t.key === activeTier);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Product Selection</h1>
        {!hasBookingProduct ? (
          <p className="text-red-600 text-sm font-semibold mt-1">⚠️ Select a Booking product first to activate your account</p>
        ) : (
          <p className="page-subtitle">Choose your products based on your eligibility tier</p>
        )}
      </div>

      {/* Tier tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TIERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTier(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTier === key
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tier info bar */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-amber-800 text-sm">{activeTierInfo.label} Products</p>
          <p className="text-amber-600 text-xs">{activeTierInfo.desc}</p>
        </div>
        <span className="badge badge-yellow">{activeTierInfo.rule}</span>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tierProducts.length === 0 ? (
          <div className="col-span-full empty-state">
            <div className="icon">📦</div>
            <p>No products available in this tier</p>
          </div>
        ) : tierProducts.map(product => {
          const owned = selectedIds.has(product.id);
          return (
            <div
              key={product.id}
              className={`card border-2 hover:shadow-md transition-all ${owned ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-100'}`}
            >
              <div className="w-full h-28 rounded-xl mb-3 flex items-center justify-center text-5xl"
                style={{ background: owned ? 'rgba(16,185,129,.1)' : '#f8fafc' }}>
                {CATEGORY_ICON[product.category] || '📦'}
              </div>
              <h3 className="font-bold text-slate-800">{product.name}</h3>
              <p className="text-brand-600 font-black text-xl mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
                ₹{parseFloat(product.price).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 capitalize mb-4">{product.category}</p>
              {owned ? (
                <div className="w-full py-2 text-center bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-sm">
                  ✓ Selected
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(product.id)}
                  disabled={!!purchasing}
                  className="btn-primary w-full justify-center"
                >
                  {purchasing === product.id ? 'Processing…' : 'Select Product'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
