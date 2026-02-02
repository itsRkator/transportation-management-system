import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN, REGISTER } from '../graphql/operations';
import { client, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../graphql/client';
import { getErrorMessage } from '../utils/errorHandler';

const AuthContext = createContext(null);

const USER_KEY = 'tms_user';

export const SESSION_EXPIRED_EVENT = 'tms-session-expired';

function persistAuth(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function throwFromResult(result, fallbackMessage) {
  const msg = result?.errors?.[0]?.message || result?.errors?.[0]?.extensions?.message || fallbackMessage;
  throw new Error(msg || fallbackMessage);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, { client });
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER, { client });

  useEffect(() => {
    const handler = () => {
      clearAuth();
      setUser(null);
      setSessionExpiredMessage('Session expired. Please sign in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, []);

  const login = useCallback(async (email, password) => {
    setSessionExpiredMessage(null);
    let result;
    try {
      result = await loginMutation({ variables: { email, password } });
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
    if (result?.errors?.length) throwFromResult(result, 'Login failed');
    const payload = result?.data?.login;
    if (!payload?.user) throw new Error(getErrorMessage(result?.errors?.[0]) || 'Login failed');
    const { accessToken, refreshToken, user: u } = payload;
    persistAuth(accessToken, refreshToken, u);
    setUser(u);
    return u;
  }, [loginMutation]);

  const register = useCallback(async (email, password, role) => {
    setSessionExpiredMessage(null);
    let result;
    try {
      result = await registerMutation({ variables: { email, password, role: role || undefined } });
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
    if (result?.errors?.length) throwFromResult(result, 'Registration failed');
    const payload = result?.data?.register;
    if (!payload?.user) throw new Error(getErrorMessage(result?.errors?.[0]) || 'Registration failed');
    const { accessToken, refreshToken, user: u } = payload;
    persistAuth(accessToken, refreshToken, u);
    setUser(u);
    return u;
  }, [registerMutation]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setSessionExpiredMessage(null);
  }, []);

  const dismissSessionExpired = useCallback(() => setSessionExpiredMessage(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loginLoading,
      registerLoading,
      sessionExpiredMessage,
      dismissSessionExpired,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
