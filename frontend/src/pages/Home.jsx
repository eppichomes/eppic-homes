import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { useCart } from '../context/CartContext';

const fmt = (n) => 'KES ' + Number(n).toLocaleString();

const CATS = [
  { key: 'all', label: 'All', icon: '🛍️' },
  { key: 'Home and Office', label: 'Home & Office', icon: '🏠' },
  { key: 'Health and Beauty', label: 'Beauty', icon: '💄' },
  { key: 'Phones and Tablets', label: 'Phones', icon: '📱' },
  { key: 'Electronics', label: 'Electronics', icon: '🔌' },
  { key: 'Fashion', label: 'Fashion', icon: '👗' },
  { key: 'Toys and Games', label: 'Toys', icon: '🎮' },
  { key: 'Sporting Goods', label: 'Sports', icon: '⚽' },
  { key: 'Baby Products', label: 'Baby', icon: '🍼' },
  { key: 'Pet Supplies', label: 'Pets', icon: '🐾' },
  { key: 'Computing', label: 'Computing', icon: '💻' },
  { key: 'Miscellaneous', label: 'More', icon: '📦' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = activeCat !== 'all' ? { category: activeCat } : {};
        const { data } = await getProducts(params);
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCat]);

  const handleAdd = (e, product) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const discount = (p) => {
    if (!p.oldPrice || p.oldPrice <= p.price) return null;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  };

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#2C2C2A', background: '#F5F5F5', minHeight: '100vh' }}>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2C5F2E 60%, #3A7A3C 100%)', color: '#fff', padding: '24px 16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(186,117,23,0.2)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#FAC775', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Nairobi's Favourite Store</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, marginBottom: 6, margin: '0 0 8px' }}>
          Shop Everything<br /><span style={{ color: '#FAC775' }}>Delivered Fast</span>
        </h1>
        <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 14, maxWidth: 260 }}>Quality products across all categories — delivered same day across Nairobi</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {['M-Pesa', 'Same-Day Delivery', 'Free Pickup', '7-Day Returns'].map(b => (
            <span key={b} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}>{b}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: 22, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Shop Now
          </button>
          <a href={`https://wa.me/${process.env.REACT_APP_SHOP_WHATSAPP || '254712345678'}`}
            target="_blank" rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 22, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>
            📱 WhatsApp
          </a>
        </div>
      </div>

      {/* Promo Strip */}
      <div style={{ background: '#BA7517', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
        <span>🎁</span>
        <span>Free delivery on orders over KES 2,000 within Nairobi · Today only</span>
      </div>

      {/* Categories */}
      <div style={{ background: '#fff', padding: '14px 12px 10px', borderBottom: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Shop by Category</div>
          <span onClick={() => navigate('/shop')} style={{ fontSize: 11, color: '#BA7517', cursor: 'pointer', fontWeight: 700 }}>See All →</span>
        </div>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none', paddingBottom: 4 }}>
          {CATS.map(cat => (
            <div key={cat.key} onClick={() => setActiveCat(cat.key)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 60 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: activeCat === cat.key ? '#EAF3DE' : '#F5F5F5', border: `2px solid ${activeCat === cat.key ? '#2C5F2E' : '#E0E0E0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transition: 'all 0.2s' }}>
                {cat.icon}
              </div>
              <div style={{ fontSize: 9, textAlign: 'center', color: activeCat === cat.key ? '#2C5F2E' : '#666', fontWeight: activeCat === cat.key ? 700 : 500, maxWidth: 56, lineHeight: 1.2 }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div id="products" style={{ padding: '14px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {activeCat === 'all' ? '🔥 Featured Products' : `${activeCat} Products`}
          </div>
          <span style={{ fontSize: 11, color: '#888' }}>{products.length} items</span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #E0E0E0' }}>
                <div style={{ height: 160, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 6, width: '80%' }} />
                  <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 16, color: '#1A3D1C', marginBottom: 6 }}>No products found</h3>
            <button onClick={() => setActiveCat('all')}
              style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              See All Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {products.map(p => {
              const disc = discount(p);
              return (
                <div key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.15s' }}>

                  {/* Image */}
                  <div style={{ height: 170, background: '#F8F8F8', position: 'relative', overflow: 'hidden' }}>
                    {disc && (
                      <div style={{ position: 'absolute', top: 6, left: 6, background: '#BA7517', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, zIndex: 1 }}>
                        -{disc}%
                      </div>
                    )}
                    {p.badge && (
                      <div style={{ position: 'absolute', top: 6, right: 6, background: p.badge === 'best' ? '#2C5F2E' : p.badge === 'new' ? '#185FA5' : '#BA7517', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, zIndex: 1 }}>
                        {p.badge === 'best' ? '⭐ BEST' : p.badge === 'new' ? 'NEW' : 'DEAL'}
                      </div>
                    )}
                    {!p.inStock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <span style={{ background: '#888', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>Sold Out</span>
                      </div>
                    )}
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => { e.target.style.display = 'none'; }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📦</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 3 }}>{p.category}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.35, marginBottom: 6, color: '#222', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#2C5F2E' }}>{fmt(p.price)}</div>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <div style={{ fontSize: 10, color: '#999', textDecoration: 'line-through' }}>{fmt(p.oldPrice)}</div>
                        )}
                      </div>
                      <button
                        onClick={e => handleAdd(e, p)}
                        disabled={!p.inStock}
                        style={{ background: addedId === p._id ? '#BA7517' : p.inStock ? '#2C5F2E' : '#ccc', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: p.inStock ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {addedId === p._id ? '✓ Added' : '+ Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#1A3D1C', padding: '14px 8px', marginTop: 8, gap: 4 }}>
        {[['📱', 'M-Pesa'], ['🚚', 'Same-Day'], ['↩️', 'Returns'], ['💬', 'WhatsApp']].map(([icon, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{icon}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ background: '#1A3D1C', color: 'rgba(255,255,255,0.7)', padding: '20px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Eppic <span style={{ color: '#FAC775' }}>Homes</span></div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>& Collections · Nairobi, Kenya</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Categories</div>
            {['Home & Office', 'Health & Beauty', 'Phones & Tablets', 'Electronics', 'Fashion'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 5, fontSize: 12, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Help</div>
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
