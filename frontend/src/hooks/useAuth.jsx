import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authMe, authLogin, authSignup, authGoogle, authFacebook, authSendOtp, authVerifyOtp, authUpdateProfile } from '@/services/api';














const AuthContext = createContext(null);

function persist(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* On mount — check for a stored token */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authMe().
    then((u) => setUser(u)).
    catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }).
    finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authLogin({ email, password });
    persist(data);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name, email, password, phone) => {
    const data = await authSignup({ name, email, password, phone });
    persist(data);
    setUser(data.user);
  }, []);

  const loginWithGoogle = useCallback(async (payload) => {
    const data = await authGoogle(payload);
    persist(data);
    setUser(data.user);
  }, []);

  const loginWithFacebook = useCallback(async (payload) => {
    const data = await authFacebook(payload);
    persist(data);
    setUser(data.user);
  }, []);

  const sendOtp = useCallback(async (phone) => {
    const resp = await authSendOtp(phone);
    return resp.otp; // available in dev mode for demo
  }, []);

  const verifyOtp = useCallback(async (phone, otp, name) => {
    const data = await authVerifyOtp({ phone, otp, name });
    persist(data);
    setUser(data.user);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await authUpdateProfile(data);
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithFacebook, sendOtp, verifyOtp, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>);

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}