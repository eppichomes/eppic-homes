import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, createProduct, updateProduct } from '../utils/api';

const CATEGORIES = ['Kitchen', 'Storage', 'Cleaning', 'Bathroom', 'Decor', 'Cooking'];
const BADGES = [{ value: '', label: 'No Badge' }, { value: 'best', label: '⭐ Best Seller' }, { value: 'deal', label: '🔥 Hot Deal' }, { value: 'new', label: '🆕 New In' }];

export default function AdminProductForm() {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();
  const fileRef = useRef();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', category: 'Kitchen', price: '', oldPrice: '',
    description: '', stock: '', featured: false, badge: '',
  });
  const [images, setImages] = useState([]); // existing image URLs
  const [newFiles, setNewFiles] = useState([]); // new files to upload
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        const { data } = await getProduct(id);
        setForm({
          name: data.name, category: data.category,
          price: data.price, oldPrice: data.oldPrice || '',
          description: data.description, stock: data.stock,
          featured: data.featured, badge: data.badge || '',
        });
        setImages(data.images || []);
      } catch { navigate('/admin'); }
      finally { setFetching(false); }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newFiles.length + images.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExisting = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const removeNew = (idx) => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      newFiles.forEach(f => formData.append('images', f));
      // Pass existing image URLs to keep
      images.forEach(url => formData.append('existingImages', url));

      if (isEdit) {
        await updateProduct(id, formData);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(formData);
        setSuccess('Product added successfully!');
        // Reset form
        setForm({ name: '', category: 'Kitchen', price: '', oldPrice: '', description: '', stock: '', featured: false, badge: '' });
        setNewFiles([]); setPreviews([]); setImages([]);
      }
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 14, outline: 'none', fontFamily: 'Georgia, serif', color: '#2C2C2A', boxSizing: 'border-box', background: '#fff' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' };

  if (fetching) return (
    <div style={{ fontFamily: 'Georgia, serif', padding: 24, textAlign: 'center', color: '#888' }}>
      Loading product...
    </div>
  );

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#F1EFE8', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1A3D1C', color: '#fff', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          Eppic <span style={{ color: '#FAC775' }}>Admin</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 10 }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </span>
        </div>
        <button onClick={() => navigate('/admin')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 16, padding: '4px 14px', cursor: 'pointer', fontSize: 12 }}>
          ← Back
        </button>
      </div>

      <div style={{ padding: 16, maxWidth: 560, margin: '0 auto' }}>

        {error && (
          <div style={{ background: '#FEE', border: '1px solid #FCC', borderRadius: 8, padding: '10px 14px', color: '#C00', fontSize: 13, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#E8F8EF', border: '1px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', color: '#0F6E56', fontSize: 13, marginBottom: 14 }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Basic info */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D1C', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1EFE8' }}>
              📝 Basic Information
            </div>

            <div style={{ marginBottom: 13 }}>
              <label style={labelStyle}>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="e.g. Non-stick Frying Pan" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 13 }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Badge</label>
                <select name="badge" value={form.badge} onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {BADGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 13 }}>
              <label style={labelStyle}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required
                placeholder="Describe the product — material, size, colour, use case..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange}
                style={{ width: 16, height: 16, accentColor: '#2C5F2E', cursor: 'pointer' }} />
              <label htmlFor="featured" style={{ fontSize: 13, color: '#5F5E5A', cursor: 'pointer' }}>
                Feature this product on the homepage
              </label>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D1C', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1EFE8' }}>
              💰 Pricing & Stock
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Price (KES) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="1"
                  placeholder="1200" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Old Price (KES)</label>
                <input type="number" name="oldPrice" value={form.oldPrice} onChange={handleChange} min="1"
                  placeholder="1500" style={inputStyle} />
                <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>For strike-through</div>
              </div>
              <div>
                <label style={labelStyle}>Stock Qty *</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
                  placeholder="50" style={inputStyle} />
              </div>
            </div>

            {form.price && form.oldPrice && Number(form.oldPrice) > Number(form.price) && (
              <div style={{ marginTop: 10, background: '#EAF3DE', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2C5F2E', fontWeight: 600 }}>
                💡 Discount: {Math.round((1 - form.price / form.oldPrice) * 100)}% off · Customer saves {(form.oldPrice - form.price).toLocaleString ? `KES ${(Number(form.oldPrice) - Number(form.price)).toLocaleString()}` : ''}
              </div>
            )}
          </div>

          {/* Images */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D1C', marginBottom: 4, paddingBottom: 10, borderBottom: '1px solid #F1EFE8' }}>
              📸 Product Images
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>Up to 4 images · JPG, PNG, WebP · Max 5MB each</div>

            {/* Existing images */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: images.length + newFiles.length < 4 ? 12 : 0 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #D3D1C7' }} />
                  <button type="button" onClick={() => removeExisting(i)}
                    style={{ position: 'absolute', top: -6, right: -6, background: '#C00', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              ))}

              {previews.map((url, i) => (
                <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid #2C5F2E' }} />
                  <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#2C5F2E', color: '#fff', borderRadius: 8, fontSize: 9, padding: '1px 4px', fontWeight: 700 }}>NEW</div>
                  <button type="button" onClick={() => removeNew(i)}
                    style={{ position: 'absolute', top: -6, right: -6, background: '#C00', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              ))}

              {images.length + newFiles.length < 4 && (
                <div onClick={() => fileRef.current.click()}
                  style={{ width: 80, height: 80, border: '2px dashed #D3D1C7', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', fontSize: 22 }}>
                  <span>+</span>
                  <span style={{ fontSize: 9, marginTop: 2 }}>Add Photo</span>
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles}
              style={{ display: 'none' }} />

            {images.length + newFiles.length === 0 && (
              <button type="button" onClick={() => fileRef.current.click()}
                style={{ width: '100%', border: '2px dashed #D3D1C7', borderRadius: 10, padding: '20px', background: '#F9F9F7', cursor: 'pointer', color: '#888', fontSize: 13, fontFamily: 'Georgia, serif' }}>
                📷 Click to upload product photos
              </button>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => navigate('/admin')}
              style={{ flex: 1, background: '#F1EFE8', color: '#5F5E5A', border: '1px solid #D3D1C7', borderRadius: 22, padding: 13, fontSize: 14, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, background: loading ? '#9BCCB7' : '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}>
              {loading ? 'Saving...' : isEdit ? '✓ Update Product' : '+ Add Product'}
            </button>
          </div>

        </form>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
