import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eppic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Products
export const getProducts = (params) => API.get('/api/products', { params });
export const getProduct = (id) => API.get(`/api/products/${id}`);
export const createProduct = (data) => API.post('/api/products', data);
export const updateProduct = (id, data) => API.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/api/products/${id}`);

// Orders
export const createOrder = (data) => API.post('/api/orders', data);
export const trackOrder = (orderNumber) => API.get(`/api/orders/track/${orderNumber}`);
export const getOrders = (params) => API.get('/api/orders', { params });
export const updateOrderStatus = (id, status) => API.put(`/api/orders/${id}/status`, { status });
export const getTodaySummary = () => API.get('/api/orders/summary/today');

// M-Pesa
export const stkPush = (data) => API.post('/api/mpesa/stkpush', data);
export const verifyMpesa = (data) => API.post('/api/mpesa/verify', data);

// Auth
export const login = (data) => API.post('/api/auth/login', data);

// Admin stats
export const getAdminStats = () => API.get('/api/admin/stats');

export default API;
