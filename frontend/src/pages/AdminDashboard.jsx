import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getOrders, updateOrderStatus, deleteProduct, getProducts } from '../utils/api';

const fmt = (n) => 'KES ' + (n || 0).toLocaleString();

const STATUS_COLORS = {
  pending: '#BA7517', confirmed: '#185FA5', preparing: '#7B2D8B',
  dispatched: '#1D9E75', delivered: '#2C5F2E', cancelled: '#C00'
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchData(); }, [tab, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        getAdminStats(),
        getOrders(statusFilter ? { status: statusFilter } : {}),
        getProducts(),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchData();
    } finally { setUpdatingId(null); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    fetchData();
  };

  const tabStyle = (t) => ({
    padding: '8px 16px', border: 'none', borderBottom: `3px solid ${tab === t ? '#2C5F2E' : 'transparent'}`,
    background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
    color: tab === t ? '#2C5F2E' : '#888', fontFamily: 'Georgia, serif',
  });

  return (
    <div style={{ fontFamily: 'Georgia, serif', minHeight: '100vh', background: '#F1EFE8' }}>
      {/* Admin nav */}
      <div style={{ background: '#1A3D1C', color: '#fff', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Eppic <span style={{ color: '#FAC775' }}>Admin</span></span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 10 }}>Welcome, {user?.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 16, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>View Store</button>
          <button onClick={() => { logout(); navigate('/admin/login'); }} style={{ background: '#C65D2A', border: 'none', color: '#fff', borderRadius: 16, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: "Today's Orders", value: stats.today.orders, icon: '🛍️', sub: `${stats.today.pending} pending` },
              { label: "Today's Revenue", value: fmt(stats.today.revenue), icon: '💰', sub: `${stats.today.dispatched} dispatched` },
              { label: 'Month Revenue', value: fmt(stats.month.revenue), icon: '📈', sub: `${stats.month.orders} orders` },
              { label: 'Low Stock Items', value: stats.inventory.lowStock.length, icon: '⚠️', sub: 'Need restocking', alert: stats.inventory.lowStock.length > 0 },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: 14, border: `1px solid ${s.alert ? '#FCC' : '#D3D1C7'}` }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.alert ? '#C00' : '#1A3D1C' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#2C5F2E', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Low stock alert */}
        {stats?.inventory.lowStock.length > 0 && (
          <div style={{ background: '#FFF3CD', border: '1px solid #FFD700', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#856404', marginBottom: 6 }}>⚠️ Low Stock Alert</div>
            {stats.inventory.lowStock.map(p => (
              <div key={p.id} style={{ fontSize: 11, color: '#856404', marginBottom: 2 }}>• {p.name} — only {p.stock} left</div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ background: '#fff', borderRadius: '10px 10px 0 0', borderBottom: '1px solid #D3D1C7', display: 'flex' }}>
          {[['orders','📋 Orders'],['products','📦 Products']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={tabStyle(key)}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ background: '#fff', padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : tab === 'orders' ? (
          <div style={{ background: '#fff', borderRadius: '0 0 10px 10px', padding: 16 }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {['','pending','confirmed','preparing','dispatched','delivered'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: '4px 12px', borderRadius: 16, border: `1px solid ${statusFilter === s ? '#2C5F2E' : '#D3D1C7'}`, background: statusFilter === s ? '#EAF3DE' : '#fff', fontSize: 11, cursor: 'pointer', fontWeight: statusFilter === s ? 700 : 400, color: statusFilter === s ? '#2C5F2E' : '#5F5E5A' }}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>No orders found</div>
            ) : orders.map(order => (
              <div key={order._id} style={{ border: '1px solid #D3D1C7', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ background: '#2C5F2E', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{order.orderNumber}</span>
                    <span style={{ background: STATUS_COLORS[order.status], color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{order.customer.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>📞 {order.customer.phone} · 📍 {order.delivery.area}</div>
                <div style={{ fontSize: 12, color: '#5F5E5A', marginBottom: 8 }}>
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2C5F2E' }}>{fmt(order.total)}</div>
                  <select value={order.status}
                    onChange={e => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    style={{ fontSize: 12, border: '1px solid #D3D1C7', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                    {['pending','confirmed','preparing','dispatched','delivered','cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '0 0 10px 10px', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: '#888' }}>{products.length} products</div>
              <button onClick={() => navigate('/admin/product/new')}
                style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                + Add Product
              </button>
            </div>
            {products.map(p => (
              <div key={p._id} style={{ display: 'flex', gap: 10, border: '1px solid #D3D1C7', borderRadius: 10, padding: 12, marginBottom: 10, alignItems: 'center' }}>
                <div style={{ background: '#F1EFE8', width: 52, height: 52, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>📦</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2C5F2E' }}>{fmt(p.price)}</span>
                    <span style={{ fontSize: 11, color: p.stock <= 5 ? '#C00' : '#888' }}>Stock: {p.stock}</span>
                    {!p.inStock && <span style={{ background: '#FEE', color: '#C00', borderRadius: 8, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>Out of Stock</span>}
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(p._id)}
                  style={{ background: '#FEE', border: '1px solid #FCC', color: '#C00', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}
