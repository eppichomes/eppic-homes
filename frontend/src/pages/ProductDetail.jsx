import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProducts } from '../utils/api';
import { useCart } from '../context/CartContext';

const fmt = (n) => 'KES ' + n.toLocaleString();

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('description');

  const cartQty = product ? (cart[product._id]?.qty || 0) : 0;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getProduct(id);
        setProduct(data);
        setActiveImg(0);
        // Get related products from same category
        const { data: all } = await getProducts({ category: data.category });
        setRelated(all.filter(p => p._id !== id).slice(0, 4));
      } catch { navigate('/shop'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAdd = () => {
    if (!product?.inStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product?.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  if (loading) return (
    <div style={{ fontFamily: 'Georgia, serif', padding: 16 }}>
      <div style={{ height: 280, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', borderRadius: 14, marginBottom: 16 }} />
      <div style={{ height: 20, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, width: '70%' }} />
      <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '40%' }} />
      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, width: '60%' }} />
    </div>
  );

  if (!product) return null;

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#2C2C2A', background: '#F1EFE8', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', padding: '10px 16px', fontSize: 11, color: '#888', borderBottom: '1px solid #D3D1C7' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#2C5F2E' }}>Home</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span onClick={() => navigate(`/shop/${product.category}`)} style={{ cursor: 'pointer', color: '#2C5F2E' }}>{product.category}</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: '#888' }}>{product.name}</span>
      </div>

      {/* Image gallery */}
      <div style={{ background: '#fff' }}>
        <div style={{ position: 'relative', height: 280, background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {product.badge && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: product.badge === 'deal' ? '#BA7517' : product.badge === 'new' ? '#185FA5' : '#2C5F2E', color: '#fff', borderRadius: 10, padding: '3px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', zIndex: 1 }}>
              {product.badge === 'best' ? 'Best Seller' : product.badge === 'deal' ? 'Hot Deal' : 'New In'}
            </div>
          )}
          {discount && (
            <div style={{ position: 'absolute', top: 12, right: 12, background: '#C65D2A', color: '#fff', borderRadius: 10, padding: '3px 10px', fontSize: 10, fontWeight: 700, zIndex: 1 }}>
              -{discount}% OFF
            </div>
          )}
          {product.images?.[activeImg]
            ? <img src={product.images[activeImg]} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 80 }}>📦</span>
          }
        </div>

        {/* Thumbnail strip */}
        {product.images?.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto' }}>
            {product.images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)}
                style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: `2px solid ${activeImg === i ? '#2C5F2E' : '#D3D1C7'}`, cursor: 'pointer' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{ background: '#fff', padding: '16px 16px 0', marginTop: 8 }}>
        <div style={{ fontSize: 10, color: '#888780', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
          {product.category} · SKU: {product.sku || 'EHC-001'}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: '#1A3D1C', marginBottom: 10 }}>
          {product.name}
        </h1>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#2C5F2E' }}>{fmt(product.price)}</span>
          {product.oldPrice && (
            <span style={{ fontSize: 16, color: '#888780', textDecoration: 'line-through' }}>{fmt(product.oldPrice)}</span>
          )}
          {discount && (
            <span style={{ fontSize: 12, background: '#FEE3D0', color: '#C65D2A', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>
              Save {fmt(product.oldPrice - product.price)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.inStock ? '#2C5F2E' : '#C00' }} />
          <span style={{ fontSize: 12, color: product.inStock ? '#2C5F2E' : '#C00', fontWeight: 600 }}>
            {product.inStock
              ? product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock'
              : 'Out of Stock'}
          </span>
        </div>

        {/* Delivery info */}
        <div style={{ background: '#EAF3DE', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>🚚</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3D1C', marginBottom: 2 }}>Same-Day Delivery Available</div>
            <div style={{ fontSize: 11, color: '#5F5E5A' }}>Order before 12pm · Free delivery on orders over KES 2,000 · Free Click & Collect</div>
          </div>
        </div>

        {/* Quantity + Add to cart */}
        {product.inStock && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D3D1C7', borderRadius: 22, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ background: '#F1EFE8', border: 'none', width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#2C5F2E', fontWeight: 700 }}>−</button>
                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ background: '#F1EFE8', border: 'none', width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#2C5F2E', fontWeight: 700 }}>+</button>
              </div>
              {cartQty > 0 && (
                <span style={{ fontSize: 12, color: '#2C5F2E', fontWeight: 600 }}>({cartQty} already in cart)</span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={handleAdd} disabled={!product.inStock}
            style={{ flex: 1, background: added ? '#BA7517' : product.inStock ? '#2C5F2E' : '#D3D1C7', color: '#fff', border: 'none', borderRadius: 22, padding: '13px', fontSize: 14, fontWeight: 700, cursor: product.inStock ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }}>
            {added ? '✓ Added to Cart!' : product.inStock ? `Add to Cart — ${fmt(product.price * qty)}` : 'Out of Stock'}
          </button>
          <a href={`https://wa.me/${process.env.REACT_APP_SHOP_WHATSAPP || '254712345678'}?text=Hi! I'd like to order: ${product.name} (${fmt(product.price)})`}
            target="_blank" rel="noreferrer"
            style={{ background: '#25D366', color: '#fff', borderRadius: 22, padding: '13px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            Order via WA
          </a>
        </div>

        {/* M-Pesa note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid #F1EFE8', marginBottom: 4 }}>
          <span style={{ background: '#00A550', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>M-PESA</span>
          <span style={{ fontSize: 11, color: '#888' }}>Accepted · Secure STK Push payment</span>
        </div>
      </div>

      {/* Tabs: Description / Details */}
      <div style={{ background: '#fff', marginTop: 8 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #D3D1C7' }}>
          {[['description', 'Description'], ['details', 'Product Details']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: '12px', border: 'none', borderBottom: `3px solid ${tab === key ? '#2C5F2E' : 'transparent'}`, background: 'none', fontSize: 13, fontWeight: tab === key ? 700 : 400, color: tab === key ? '#2C5F2E' : '#888', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: 16 }}>
          {tab === 'description' ? (
            <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7 }}>
              {product.description || 'No description available for this product.'}
            </p>
          ) : (
            <div>
              {[
                ['Product Name', product.name],
                ['Category', product.category],
                ['SKU', product.sku || 'EHC-001'],
                ['Price', fmt(product.price)],
                ['Availability', product.inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1EFE8', fontSize: 13 }}>
                  <span style={{ color: '#888', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#2C2C2A', fontWeight: 400 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Return policy */}
      <div style={{ background: '#fff', marginTop: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3D1C', marginBottom: 8 }}>📋 Policies</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['↩️', '7-day returns on unused items with original packaging'],
            ['🔄', 'Exchange faulty items within 7 days of purchase'],
            ['🚚', 'Same-day delivery within Nairobi for orders before 12pm'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#5F5E5A' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ padding: '16px 16px 24px', marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A3D1C', marginBottom: 12 }}>
            You Might Also Like
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {related.map(p => (
              <div key={p._id} onClick={() => navigate(`/product/${p._id}`)}
                style={{ background: '#fff', border: '1px solid #D3D1C7', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: '#F1EFE8', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 36 }}>📦</span>}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2C5F2E' }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
