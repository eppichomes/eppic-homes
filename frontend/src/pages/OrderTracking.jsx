import { useState } from 'react';
import { trackOrder } from '../utils/api';

const STATUSES = ['pending','confirmed','preparing','dispatched','delivered'];
const STATUS_LABELS = { pending:'Order Placed', confirmed:'Payment Confirmed', preparing:'Being Prepared', dispatched:'Out for Delivery', delivered:'Delivered' };
const STATUS_ICONS = { pending:'📝', confirmed:'✅', preparing:'📦', dispatched:'🚚', delivered:'🎉' };

export default function OrderTracking() {
  const [orderNum, setOrderNum] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async () => {
    if (!orderNum.trim()) return setError('Please enter your order number');
    setLoading(true); setError('');
    try {
      const { data } = await trackOrder(orderNum.trim().toUpperCase());
      setOrder(data);
    } catch {
      setError('Order not found. Please check your order number and try again.');
    } finally { setLoading(false); }
  };

  const currentIdx = order ? STATUSES.indexOf(order.status) : -1;

  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📍</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3D1C', marginBottom: 4 }}>Track Your Order</h1>
        <p style={{ fontSize: 12, color: '#888' }}>Enter your order number to see the latest status</p>
      </div>

      <div style={{ marginBottom: 13 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Number</label>
        <input value={orderNum} onChange={e => setOrderNum(e.target.value)} placeholder="e.g. EHC-1023"
          style={{ width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 14, outline: 'none', fontFamily: 'Georgia, serif', textTransform: 'uppercase', boxSizing: 'border-box' }} />
      </div>

      {error && <div style={{ background: '#FEE', border: '1px solid #FCC', borderRadius: 8, padding: '10px 14px', color: '#C00', fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <button onClick={track} disabled={loading}
        style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Searching...' : 'Track Order →'}
      </button>

      {order && (
        <div style={{ marginTop: 24 }}>
          <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ background: '#2C5F2E', color: '#fff', borderRadius: 8, padding: '2px 12px', fontSize: 13, fontWeight: 700 }}>{order.orderNumber}</div>
              <div style={{ fontSize: 12, color: '#5F5E5A' }}>{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div style={{ fontSize: 13, color: '#1A3D1C', fontWeight: 600, marginBottom: 4 }}>Hi {order.customer.name}!</div>
            <div style={{ fontSize: 12, color: '#5F5E5A' }}>
              {order.delivery.method === 'pickup' ? '🏪 Click & Collect' : `🚚 Delivery to ${order.delivery.area}`}
            </div>
          </div>

          {/* Status timeline */}
          <div style={{ marginBottom: 20 }}>
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s} style={{ display: 'flex', gap: 14, paddingBottom: i < STATUSES.length - 1 ? 0 : undefined }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? '#2C5F2E' : '#F1EFE8', border: `2px solid ${done ? '#2C5F2E' : '#D3D1C7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {done ? STATUS_ICONS[s] : <span style={{ fontSize: 12, color: '#888' }}>{i + 1}</span>}
                    </div>
                    {i < STATUSES.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 24, background: i < currentIdx ? '#2C5F2E' : '#D3D1C7', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 20, paddingTop: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 600, color: done ? '#1A3D1C' : '#888' }}>{STATUS_LABELS[s]}</div>
                    {active && <div style={{ fontSize: 11, color: '#2C5F2E', fontWeight: 600, marginTop: 2 }}>Current status</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div style={{ background: '#F1EFE8', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#5F5E5A', marginBottom: 10 }}>Items in this order</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: '#5F5E5A' }}>
                <span>{item.name} ×{item.quantity}</span>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #D3D1C7', marginTop: 6 }}>
              <span>Total</span><span>KES {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
