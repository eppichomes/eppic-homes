import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const fmt = (n) => 'KES ' + n.toLocaleString();

export default function Navbar() {
  const { items, itemCount, subtotal, deliveryFee, total, changeQty, removeFromCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      {/* Top bar */}
      <div style={{ background: '#1A3D1C', color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '6px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Free delivery on orders over <strong style={{ color: '#FAC775' }}>KES 2,000</strong> within Nairobi</span>
        <span>📞 0746 251 745</span>
      </div>

      {/* Main nav */}
      <nav style={{ background: '#2C5F2E', borderBottom: '3px solid #BA7517', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>
              Eppic <span style={{ color: '#FAC775' }}>Homes</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              & Collections
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <form onSubmit={handleSearch}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 20, padding: '6px 14px', color: '#fff', fontSize: 12, width: 150, outline: 'none' }}
            />
          </form>

          <button onClick={() => setCartOpen(true)}
            style={{ background: '#BA7517', border: 'none', borderRadius: 20, padding: '6px 16px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            Cart
            <span style={{ background: '#fff', color: '#BA7517', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {itemCount}
            </span>
          </button>

          <a href={`https://wa.me/${process.env.REACT_APP_SHOP_WHATSAPP || '254746251745'}`}
            target="_blank" rel="noreferrer"
            style={{ background: '#25D366', border: 'none', borderRadius: 20, padding: '6px 12px', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
        </div>
      </nav>

      {/* Cart overlay */}
      {cartOpen && (
        <div onClick={() => setCartOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }} />
      )}

      {/* Cart drawer */}
      <div style={{
        position: 'fixed', top: 0, right: cartOpen ? 0 : '-100%', width: '100%', maxWidth: 340,
        height: '100vh', background: '#fff', zIndex: 1000,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.18)', transition: 'right 0.3s ease',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ background: '#2C5F2E', borderBottom: '3px solid #BA7517', color: '#fff', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Cart ({itemCount} items)</h3>
          <button onClick={() => setCartOpen(false)}
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#888' }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🛒</div>
              <p style={{ fontWeight: 600 }}>Your cart is empty</p>
            </div>
          ) : items.map(item => (
            <div key={item._id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #D3D1C7' }}>
              <div style={{ background: '#F1EFE8', width: 52, height: 52, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#2C5F2E', fontWeight: 700 }}>{fmt(item.price)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <button onClick={() => changeQty(item._id, -1)} style={{ background: '#F1EFE8', border: '1px solid #D3D1C7', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer' }}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => changeQty(item._id, 1)} style={{ background: '#F1EFE8', border: '1px solid #D3D1C7', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer' }}>+</button>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', marginLeft: 4 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 14, borderTop: '1px solid #D3D1C7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 5 }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 8 }}>
              <span>Delivery</span>
              <span style={{ color: deliveryFee === 0 ? '#2C5F2E' : undefined, fontWeight: deliveryFee === 0 ? 700 : undefined }}>
                {deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, paddingTop: 10, borderTop: '1px solid #D3D1C7', marginBottom: 12 }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <button onClick={() => { setCartOpen(false); navigate('/checkout'); }}
              style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Proceed to Checkout →
            </button>
            <p style={{ fontSize: 10, color: '#888', textAlign: 'center', marginTop: 7 }}>Order before 12pm for same-day delivery</p>
          </div>
        )}
      </div>
    </>
  );
}
