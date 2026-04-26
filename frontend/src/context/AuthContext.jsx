import { createContext, useContext, useState } from 'react';
import { login as loginApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eppic_user')); } catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('eppic_token', data.token);
    localStorage.setItem('eppic_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('eppic_token');
    localStorage.removeItem('eppic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
