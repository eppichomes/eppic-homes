import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else setError('You do not have admin access.');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: 'Georgia, serif', minHeight: '100vh', background: '#1A3D1C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏡</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3D1C' }}>Eppic <span style={{ color: '#BA7517' }}>Homes</span></div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>& Collections</div>
          <div style={{ fontSize: 12, color: '#888' }}>Admin Dashboard</div>
        </div>

        {error && <div style={{ background: '#FEE', border: '1px solid #FCC', borderRadius: 8, padding: '10px 14px', color: '#C00', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@eppichomes.co.ke" required
              style={{ width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 14, outline: 'none', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 14, outline: 'none', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
