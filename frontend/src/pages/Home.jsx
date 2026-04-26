import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { useCart } from '../context/CartContext';

const fmt = (n) => 'KES ' + n.toLocaleString();
const CATS = [
  { key: 'all', label: 'All Items', icon: '🛍️' },
  { key: 'Kitchen', label: 'Kitchen', icon: '🍳' },
  { key: 'Storage', label: 'Storage', icon: '📦' },
  { key: 'Cleaning', label: 'Cleaning', icon: '🧹' },
  { key: 'Bathroom', label: 'Bathroom', icon: '🚿' },
  { key: 'Decor', label: 'Décor', icon: '🪴' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = activeCat !== 'all' ? { category: activeCat } : {};
        const { data } = await getProducts(params);
        setProducts(data);
      } catch {
        // fallback: empty
      } finally { setLoading(false); }
    };
    fetch();
  }, [activeCat]);

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#2C2C2A' }}>
      {/* Hero */}
      <div style={{ background: '#2C5F2E', color: '#fff', padding: '32px 16px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(186,117,23,0.15)' }} />
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#EF9F27', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Nairobi's Home Store</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Kitchen & Home<br /><span style={{ color: '#FAC775' }}>Essentials</span>
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16, maxWidth: 280 }}>Quality products for every home — delivered same day across Nairobi</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {['M-Pesa Accepted', 'Same-Day Delivery', 'Free Pickup', '7-Day Returns'].map(b => (
            <span key={b} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}>{b}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: 22, padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Shop Now
          </button>
          <a href={`https://wa.me/${process.env.REACT_APP_SHOP_WHATSAPP || '254712345678'}`}
            target="_blank" rel="noreferrer"
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 22, padding: '11px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>
            WhatsApp Us
          </a>
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 16, fontSize: 72, opacity: 0.18 }}>🏡</div>
      </div>

      {/* Categories */}
      <div style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Shop by Category</div>
          <span onClick={() => navigate('/shop')} style={{ fontSize: 11, color: '#BA7517', cursor: 'pointer', fontWeight: 700 }}>See All →</span>
        </div>
        <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase' }}>KITCHEN · STORAGE · CLEANING · DÉCOR</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {CATS.map(cat => (
            <div key={cat.key} onClick={() => setActiveCat(cat.key)}
              style={{ background: activeCat === cat.key ? '#EAF3DE' : '#F1EFE8', border: `1.5px solid ${activeCat === cat.key ? '#2C5F2E' : 'transparent'}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontSize: 10, color: activeCat === cat.key ? '#1A3D1C' : '#5F5E5A', fontWeight: activeCat === cat.key ? 700 : 600, letterSpacing: '0.3px' }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div style={{ background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: 10, padding: '13px 16px', margin: '0 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎁</span>
          <div>
            <div style={{ fontSize: 13, color: '#BA7517', fontWeight: 700 }}>Free delivery on orders over KES 2,000</div>
            <div style={{ fontSize: 11, color: '#BA7517' }}>Within Nairobi · Today only</div>
          </div>
        </div>
        <button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
          style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: 16, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Shop Now
        </button>
      </div>

      {/* Products */}
      <div id="products" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{activeCat === 'all' ? 'Featured Products' : `${activeCat} Products`}</div>
          <span style={{ fontSize: 11, color: '#888780' }}>{products.length} items</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No products found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {products.map(p => (
              <div key={p._id}
                style={{ background: '#fff', border: '1px solid #D3D1C7', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate(`/product/${p._id}`)}>
                <div style={{ background: '#F1EFE8', height: 115, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {p.badge && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: p.badge === 'deal' ? '#BA7517' : p.badge === 'new' ? '#185FA5' : '#2C5F2E', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>
                      {p.badge === 'best' ? 'Best Seller' : p.badge === 'deal' ? 'Hot Deal' : 'New In'}
                    </div>
                  )}
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 46 }}>📦</span>}
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#888780', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C5F2E' }}>{fmt(p.price)}</div>
                      {p.oldPrice && <div style={{ fontSize: 10, color: '#888780', textDecoration: 'line-through' }}>{fmt(p.oldPrice)}</div>}
                    </div>
                    {p.inStock
                      ? <button onClick={e => { e.stopPropagation(); addToCart(p); }}
                          style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          +
                        </button>
                      : <span style={{ background: '#F1EFE8', color: '#888780', borderRadius: 12, padding: '4px 10px', fontSize: 10 }}>Sold Out</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '14px 16px', background: '#1A3D1C', marginTop: 16 }}>
        {[['📱', 'M-Pesa'], ['🚀', 'Same-Day'], ['↩️', '7-Day Returns'], ['💬', 'WhatsApp']].map(([icon, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ background: '#1A3D1C', color: 'rgba(255,255,255,0.7)', padding: '20px 16px 16px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Eppic <span style={{ color: '#FAC775' }}>Homes</span></div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 14 }}>& Collections · Nairobi, Kenya</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 7 }}>Shop</div>
            {['Kitchen Essentials', 'Storage & Organisation', 'Cleaning & Laundry', 'Home Décor'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 5, fontSize: 12, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 7 }}>Help</div>
            {['Track My Order', 'Delivery Areas', 'Return Policy', 'WhatsApp Us'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 5, fontSize: 12, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>© 2025 Eppic Homes & Collections</span>
          <span style={{ background: '#00A550', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>M-PESA</span>
        </div>
      </footer>
    </div>
  );
}
