import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const adminUsers = {
  'praveen@gmail.com': {
    passwordHash: '46ba2308703f63735422fc69846f890e79cabad26e7798d4f0442e1309625241',
    role: 'admin'
  },
  'admin@ethara.ai': {
    passwordHash: 'd20e96c37ac1ef08d05917727751515b2741b0a8e657f9863bdd9023321529c8',
    role: 'admin'
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'admin');

  const value = useMemo(() => ({
    token,
    role,
    isAuthenticated: Boolean(token),
    async login(credentials) {
      const user = adminUsers[credentials.email];
      if (!user || user.passwordHash !== credentials.password_hash) {
        throw new Error('Invalid email or password');
      }
      const localToken = `local-admin-${Date.now()}`;
      localStorage.setItem('access_token', localToken);
      localStorage.setItem('role', user.role);
      setToken(localToken);
      setRole(user.role);
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
