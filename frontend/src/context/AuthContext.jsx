import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN, ME } from '../graphql/operations';
import { client } from '../graphql/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tms_token';
const USER_KEY = 'tms_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, { client });

  const login = useCallback(async (email, password) => {
    const { data } = await loginMutation({ variables: { email, password } });
    const { token, user: u } = data.login;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, [loginMutation]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
