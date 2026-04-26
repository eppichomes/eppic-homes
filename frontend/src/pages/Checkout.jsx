import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, stkPush, verifyMpesa } from '../utils/api';

const fmt = (n) => 'KES ' + n.toLocaleString();

export default function Checkout() {
  const { items, subtotal, total, deliveryFee, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState('boda');
  const [form, setForm] = useState({ name: '', phone: '', area: '', address: '', instructions: '' });
  const [mpesaCode, setMpesaCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payMode, setPayMode] = useState('stk'); // stk or manual

  const finalDelivery = delivery === 'pickup' ? 0 : deliveryFee;
  const finalTotal = subtotal + finalDelivery;

  const handleForm = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const placeOrder = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await createOrder({
        customer: { name: form.name, phone: form.phone },
        delivery: { method: delivery, area: form.area, address: form.address, instructions: form.instructions },
        items: items.map(i => ({ productId: i._id, quantity: i.qty })),
      });
      setOrder(data);
      if (payMode === 'stk') {
        await stkPush({ phone: form.phone, amount: finalTotal, orderNumber: data.orderNumber });
      }
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const verifyPayment = async () => {
    setLoading(true); setError('');
    try {
      await verifyMpesa({ orderNumber: order.orderNumber, mpesaCode, phone: form.phone });
      clearCart();
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Check your code and try again.');
    } finally { setLoading(false); }
  };

  if (items.length === 0 && step < 4) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🛒</div>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: '11px 28px', marginTop: 16, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const dot = (n) => (
    <div style={{ height: 6, borderRadius: 3, background: step >= n ? '#2C5F2E' : '#D3D1C7', width: step >= n ? 28 : 8, transition: 'all 0.3s' }} />
  );

  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Eppic Homes & Collections</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>{dot(1)}{dot(2)}{dot(3)}{dot(4)}</div>

      {error && <div style={{ background: '#FEE', border: '1px solid #FCC', borderRadius: 8, padding: '10px 14px', color: '#C00', fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {/* STEP 1 — Details */}
      {step === 1 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A3D1C', marginBottom: 4 }}>Delivery Details</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>Step 1 of 3 — Where should we deliver?</p>
          {[['name','Full Name','Jane Muthoni'],['phone','M-Pesa Phone Number','0712 345 678'],['area','Delivery Area / Estate','e.g. Kasarani, Nairobi'],['address','Street / Apartment','e.g. Mwiki Road, Apt 4B'],['instructions','Delivery Instructions (optional)','e.g. Call when you arrive']].map(([key, label, ph]) => (
            <div key={key} style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>
              <input name={key} value={form[key]} onChange={handleForm} placeholder={ph}
                style={{ width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 14, outline: 'none', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Delivery Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['boda','🏍️','Boda Delivery', subtotal >= 2000 ? 'FREE' : 'KES 150'],['pickup','🏪','Click & Collect','FREE']].map(([key, icon, name, price]) => (
                <div key={key} onClick={() => setDelivery(key)}
                  style={{ border: `1.5px solid ${delivery === key ? '#2C5F2E' : '#D3D1C7'}`, background: delivery === key ? '#EAF3DE' : '#fff', borderRadius: 10, padding: 11, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 11, color: delivery === key ? '#2C5F2E' : '#888', marginTop: 2, fontWeight: delivery === key ? 700 : 400 }}>{price}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { if (!form.name || !form.phone || (!form.area && delivery === 'boda')) { setError('Please fill in all required fields.'); return; } setError(''); setStep(2); }}
            style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Continue to Payment →
          </button>
        </>
      )}

      {/* STEP 2 — Review & Pay */}
      {step === 2 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A3D1C', marginBottom: 4 }}>Confirm & Pay</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>Step 2 of 3 — Review your order</p>
          <div style={{ background: '#F1EFE8', borderRadius: 10, padding: 14, marginBottom: 14, borderLeft: '3px solid #2C5F2E' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#2C5F2E', marginBottom: 10, textTransform: 'uppercase' }}>Order Summary</div>
            {items.map(i => (
              <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: '#5F5E5A' }}>
                <span>{i.name} ×{i.qty}</span><span>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: '#5F5E5A' }}>
              <span>Delivery ({delivery === 'pickup' ? 'Pickup' : 'Boda'})</span>
              <span style={{ color: finalDelivery === 0 ? '#2C5F2E' : undefined, fontWeight: finalDelivery === 0 ? 700 : undefined }}>{finalDelivery === 0 ? 'FREE' : fmt(finalDelivery)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 10, borderTop: '1px solid #D3D1C7', marginTop: 6 }}>
              <span>Total</span><span>{fmt(finalTotal)}</span>
            </div>
          </div>

          <div style={{ background: '#E8F8EF', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #9FE1CB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: '#00A550', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>M-PESA</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>STK Push Payment</span>
            </div>
            <div style={{ fontSize: 12, color: '#1D9E75', marginBottom: 10 }}>
              Click Pay below. You'll receive a prompt on <strong>{form.phone}</strong>. Enter your M-Pesa PIN to complete.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#085041' }}>
              Paybill: <strong>123456</strong> · Account: {form.phone} · Amount: <strong>{fmt(finalTotal)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setPayMode('stk')}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${payMode === 'stk' ? '#2C5F2E' : '#D3D1C7'}`, background: payMode === 'stk' ? '#EAF3DE' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              📲 Auto STK Push
            </button>
            <button onClick={() => setPayMode('manual')}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${payMode === 'manual' ? '#2C5F2E' : '#D3D1C7'}`, background: payMode === 'manual' ? '#EAF3DE' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              ✍️ Pay Manually
            </button>
          </div>

          <button onClick={placeOrder} disabled={loading}
            style={{ background: '#00A550', color: '#fff', border: 'none', borderRadius: 22, padding: 14, width: '100%', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : `Pay ${fmt(finalTotal)} with M-Pesa →`}
          </button>
          <button onClick={() => setStep(1)}
            style={{ background: '#F1EFE8', color: '#5F5E5A', border: 'none', borderRadius: 22, padding: 10, width: '100%', fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            ← Back to Details
          </button>
        </>
      )}

      {/* STEP 3 — Verify */}
      {step === 3 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A3D1C', marginBottom: 4 }}>Verify Payment</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>Step 3 of 3 — Confirm your M-Pesa payment</p>
          <div style={{ background: '#E8F8EF', borderRadius: 10, padding: 14, marginBottom: 16, border: '1px solid #9FE1CB', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📲</div>
            {payMode === 'stk'
              ? <p style={{ fontSize: 13, color: '#0F6E56' }}>An STK Push has been sent to <strong>{form.phone}</strong>. Enter your M-Pesa PIN on your phone, then enter the confirmation code below.</p>
              : <p style={{ fontSize: 13, color: '#0F6E56' }}>Please pay <strong>{fmt(finalTotal)}</strong> to Paybill <strong>123456</strong>, Account: <strong>{form.phone}</strong>. Then enter your M-Pesa confirmation code below.</p>
            }
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>M-Pesa Confirmation Code</label>
            <input value={mpesaCode} onChange={e => setMpesaCode(e.target.value.toUpperCase())}
              placeholder="e.g. QHX12345AB"
              style={{ width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 13px', fontSize: 16, outline: 'none', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 2, boxSizing: 'border-box' }} />
          </div>
          <button onClick={verifyPayment} disabled={loading || !mpesaCode}
            style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8, opacity: loading || !mpesaCode ? 0.7 : 1 }}>
            {loading ? 'Verifying...' : 'Confirm Order →'}
          </button>
        </>
      )}

      {/* STEP 4 — Success */}
      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 70, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Eppic Homes & Collections</div>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: '#2C5F2E', marginBottom: 4 }}>Order Confirmed!</h2>
          <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 18, lineHeight: 1.6 }}>
            Thank you! Your payment has been received and your order is being prepared. We'll WhatsApp you when it's on the way.
          </p>
          {order && (
            <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 10, padding: 14, textAlign: 'left', marginBottom: 16 }}>
              <div style={{ background: '#2C5F2E', color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>
                {order.orderNumber}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#2C5F2E', marginBottom: 10, textTransform: 'uppercase' }}>Order Receipt</div>
              {items.map(i => (
                <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: '#5F5E5A' }}>
                  <span>{i.name} ×{i.qty}</span><span>{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: '#5F5E5A' }}>
                <span>Delivery</span><span style={{ color: finalDelivery === 0 ? '#2C5F2E' : undefined, fontWeight: 700 }}>{finalDelivery === 0 ? 'FREE' : fmt(finalDelivery)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #C0DD97', marginTop: 4 }}>
                <span>Total Paid</span><span>{fmt(finalTotal)}</span>
              </div>
            </div>
          )}
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            Estimated delivery: Today by 4:00pm · {delivery === 'pickup' ? 'Pickup ready in 1 hour' : 'Our rider will call you'}
          </p>
          <button onClick={() => navigate('/track')}
            style={{ background: '#2C5F2E', color: '#fff', border: 'none', borderRadius: 22, padding: 13, width: '100%', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
            Track My Order
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: '#F1EFE8', color: '#2C5F2E', border: 'none', borderRadius: 22, padding: 11, width: '100%', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}
