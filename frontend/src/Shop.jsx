import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  { key: 'Cooking', label: 'Cooking', icon: '🥘' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCat, setActiveCat] = useState(category || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await getProducts();
        setProducts(data);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let list = [...products];
    if (activeCat !== 'all') list = list.filter(p => p.category === activeCat);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    list = list.filter(p => p.price <= maxPrice);
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFiltered(list);
  }, [products, activeCat, search, sort, maxPrice]);

  const handleCat = (cat) => {
    setActiveCat(cat);
    navigate(cat === 'all' ? '/shop' : `/shop/${cat}`);
  };

  const handleAdd = (e, product) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#2C2C2A', minHeight: '100vh', background: '#F1EFE8' }}>

      {/* Page header */}
      <div style={{ background: '#2C5F2E', color: '#fff', padding: '20px 16px 16px' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> › Shop
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          {activeCat === 'all' ? 'All Products' : `${activeCat} Products`}
        </h1>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search kitchen, storage, cleaning..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 22, padding: '10px 14px 10px 38px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          )}
        </div>
      </div>

      {/* Category scroll */}
      <div style={{ background: '#fff', borderBottom: '1px solid #D3D1C7', overflowX: 'auto', display: 'flex', padding: '10px 16px', gap: 8, scrollbarWidth: 'none' }}>
        {CATS.map(cat => (
          <button key={cat.key} onClick={() => handleCat(cat.key)}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${activeCat === cat.key ? '#2C5F2E' : '#D3D1C7'}`, background: activeCat === cat.key ? '#EAF3DE' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: activeCat === cat.key ? 700 : 400, color: activeCat === cat.key ? '#1A3D1C' : '#5F5E5A', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D3D1C7' }}>
        <span style={{ fontSize: 12, color: '#888' }}>
          {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
          {search && <span style={{ color: '#2C5F2E', fontWeight: 600 }}> for "{search}"</span>}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: `1.5px solid ${filtersOpen ? '#2C5F2E' : '#D3D1C7'}`, borderRadius: 16, background: filtersOpen ? '#EAF3DE' : '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif', color: filtersOpen ? '#2C5F2E' : '#5F5E5A', fontWeight: filtersOpen ? 700 : 400 }}>
            ⚙️ Filter
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ fontSize: 12, border: '1px solid #D3D1C7', borderRadius: 16, padding: '5px 10px', outline: 'none', fontFamily: 'Georgia, serif', color: '#5F5E5A', background: '#fff', cursor: 'pointer' }}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '1px solid #D3D1C7' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Max Price: <span style={{ color: '#2C5F2E' }}>{fmt(maxPrice)}</span>
          </div>
          <input type="range" min="100" max="10000" step="100" value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#2C5F2E' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 4 }}>
            <span>KES 100</span><span>KES 10,000</span>
          </div>
          <button onClick={() => { setMaxPrice(10000); setSearch(''); setActiveCat('all'); navigate('/shop'); }}
            style={{ marginTop: 10, fontSize: 12, color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Products grid */}
      <div style={{ padding: 16 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #D3D1C7' }}>
                <div style={{ height: 115, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginBottom: 6, width: '80%' }} />
                  <div style={{ height: 10, background: '#f0f0f0', borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A3D1C', marginBottom: 6 }}>No products found</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setActiveCat('all'); setMaxPrice(10000); navigate('/shop'); }}
              style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              See All Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {filtered.map(p => (
              <div key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                style={{ background: '#fff', border: '1px solid #D3D1C7', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                <div style={{ background: '#F1EFE8', height: 115, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {p.badge && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: p.badge === 'deal' ? '#BA7517' : p.badge === 'new' ? '#185FA5' : '#2C5F2E', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', zIndex: 1 }}>
                      {p.badge === 'best' ? 'Best Seller' : p.badge === 'deal' ? 'Hot Deal' : 'New In'}
                    </div>
                  )}
                  {!p.inStock && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <span style={{ background: '#888', color: '#fff', borderRadius: 10, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>Sold Out</span>
                    </div>
                  )}
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 44 }}>📦</span>}
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, lineHeight: 1.3, color: '#2C2C2A' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#888780', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C5F2E' }}>{fmt(p.price)}</div>
                      {p.oldPrice && <div style={{ fontSize: 10, color: '#888780', textDecoration: 'line-through' }}>{fmt(p.oldPrice)}</div>}
                    </div>
                    <button
                      onClick={e => handleAdd(e, p)}
                      disabled={!p.inStock}
                      style={{ background: addedId === p._id ? '#BA7517' : p.inStock ? '#2C5F2E' : '#D3D1C7', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: addedId === p._id ? 14 : 18, cursor: p.inStock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, transition: 'background 0.2s', flexShrink: 0 }}>
                      {addedId === p._id ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp CTA */}
      <div style={{ margin: '0 16px 24px', background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D1C', marginBottom: 2 }}>Can't find what you need?</div>
          <div style={{ fontSize: 11, color: '#5F5E5A' }}>WhatsApp us and we'll source it for you</div>
        </div>
        <a href={`https://wa.me/${process.env.REACT_APP_SHOP_WHATSAPP || '254712345678'}?text=Hi! I'm looking for a product not on your website.`}
          target="_blank" rel="noreferrer"
          style={{ background: '#25D366', color: '#fff', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          WhatsApp Us
        </a>
      </div>
    </div>
  );
}
