import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'admin');

  const value = useMemo(() => ({
    token,
    role,
    isAuthenticated: Boolean(token),
    async login(credentials) {
      const response = await loginRequest(credentials);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('role', response.data.role);
      setToken(response.data.access_token);
      setRole(response.data.role);
    },
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('role');
      setToken(null);
      setRole('admin');
    }
  }), [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
