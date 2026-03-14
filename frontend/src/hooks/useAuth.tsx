import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authMe, authLogin, authSignup, authGoogle, authFacebook, authSendOtp, authVerifyOtp, authUpdateProfile, type AuthUser, type AuthResponse } from '@/services/api';

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    loginWithGoogle: (payload: { googleId: string; name: string; email: string; avatar?: string }) => Promise<void>;
    loginWithFacebook: (payload: { facebookId: string; name: string; email: string; avatar?: string }) => Promise<void>;
    sendOtp: (phone: string) => Promise<string | undefined>;
    verifyOtp: (phone: string, otp: string, name?: string) => Promise<void>;
    updateProfile: (data: { nickname?: string; avatar?: string; banner?: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persist(data: AuthResponse) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    /* On mount — check for a stored token */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        authMe()
            .then((u) => setUser(u))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await authLogin({ email, password });
        persist(data);
        setUser(data.user);
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string, phone?: string) => {
        const data = await authSignup({ name, email, password, phone });
        persist(data);
        setUser(data.user);
    }, []);

    const loginWithGoogle = useCallback(async (payload: { googleId: string; name: string; email: string; avatar?: string }) => {
        const data = await authGoogle(payload);
        persist(data);
        setUser(data.user);
    }, []);

    const loginWithFacebook = useCallback(async (payload: { facebookId: string; name: string; email: string; avatar?: string }) => {
        const data = await authFacebook(payload);
        persist(data);
        setUser(data.user);
    }, []);

    const sendOtp = useCallback(async (phone: string) => {
        const resp = await authSendOtp(phone);
        return resp.otp; // available in dev mode for demo
    }, []);

    const verifyOtp = useCallback(async (phone: string, otp: string, name?: string) => {
        const data = await authVerifyOtp({ phone, otp, name });
        persist(data);
        setUser(data.user);
    }, []);

    const updateProfile = useCallback(async (data: { nickname?: string; avatar?: string; banner?: string }) => {
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
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
