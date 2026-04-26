const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// Get M-Pesa OAuth token
const getToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const url = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const res = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
  return res.data.access_token;
};

// Generate password and timestamp
const getTimestamp = () => {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
};

const getPassword = (timestamp) => {
  const str = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
};

// POST — Trigger STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, orderNumber } = req.body;

    // Format phone: 0712345678 → 254712345678
    const formattedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone.startsWith('+') ? phone.slice(1) : phone;

    const token = await getToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);

    const url = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: orderNumber,
      TransactionDesc: `Eppic Homes Order ${orderNumber}`,
    };

    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      message: 'STK Push sent. Check your phone.',
    });
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'M-Pesa request failed. Try manual payment.' });
  }
});

// POST — M-Pesa Callback (Safaricom calls this automatically)
router.post('/callback', async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { ResultCode, CallbackMetadata, AccountReference } = callback;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata?.Item || [];
      const getMeta = (name) => items.find(i => i.Name === name)?.Value || '';

      const mpesaCode = getMeta('MpesaReceiptNumber');
      const amount = getMeta('Amount');

      await Order.findOneAndUpdate(
        { orderNumber: AccountReference },
        {
          'payment.status': 'paid',
          'payment.mpesaCode': mpesaCode,
          'payment.paidAt': new Date(),
          status: 'confirmed',
        }
      );

      console.log(`✅ Payment confirmed: ${AccountReference} — KES ${amount} — ${mpesaCode}`);
    } else {
      // Payment failed
      await Order.findOneAndUpdate(
        { orderNumber: AccountReference },
        { 'payment.status': 'failed' }
      );
      console.log(`❌ Payment failed: ${AccountReference}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// POST — Manual M-Pesa verification (customer enters transaction code)
router.post('/verify', async (req, res) => {
  try {
    const { orderNumber, mpesaCode, phone } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Basic format check: M-Pesa codes are ~10 alphanumeric chars
    if (!mpesaCode || mpesaCode.length < 8) {
      return res.status(400).json({ message: 'Invalid M-Pesa code. Please check and try again.' });
    }

    order.payment.status = 'paid';
    order.payment.mpesaCode = mpesaCode.toUpperCase();
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    await order.save();

    res.json({ success: true, message: 'Payment verified. Order confirmed!', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
