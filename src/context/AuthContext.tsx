import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

type User = { id: string; email: string; name: string; role: 'ADMIN' | 'FACULTY' };
type AuthContextType = { user: User | null; loading: boolean; login: (data: any) => Promise<void>; logout: () => Promise<void> };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (data: any) => {
    await api.post('/auth/login', data);
    const res = await api.get('/auth/me');
    setUser(res.data);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
