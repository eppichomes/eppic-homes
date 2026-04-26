import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eppic_cart')) || {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('eppic_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product._id]: prev[product._id]
        ? { ...prev[product._id], qty: prev[product._id].qty + 1 }
        : { ...product, qty: 1 }
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) { const n = { ...prev }; delete n[id]; return n; }
      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  };

  const clearCart = () => setCart({});

  const items = Object.values(cart);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cart, items, itemCount, subtotal, deliveryFee, total,
      addToCart, removeFromCart, changeQty, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
