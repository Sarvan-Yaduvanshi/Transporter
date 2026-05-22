import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authGoogle, authMe, authUpdateProfile } from '../services/api';

const AuthContext = createContext(null);

const syncFirebaseUser = async (firebaseUser) => {
  const idToken = await firebaseUser.getIdToken();
  const response = await authGoogle(idToken);
  const nextUser = response?.data?.user;
  if (!response?.success || !nextUser) {
    throw new Error(response?.message || 'Failed to sync user');
  }
  return nextUser;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const redirectHandled = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Step 1: Check if we're returning from a Google redirect
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && !cancelled) {
          redirectHandled.current = true;
          const synced = await syncFirebaseUser(result.user);
          if (!cancelled) {
            setUser(synced);
            setLoading(false);
            return; // Done — don't need onAuthStateChanged to run
          }
        }
      } catch (err) {
        console.error('Google redirect error:', err);
      }

      // Step 2: Listen for auth state changes (normal page load / email login)
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return;

        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // If redirect already handled this user, skip
        if (redirectHandled.current) {
          redirectHandled.current = false;
          return;
        }

        setLoading(true);
        try {
          const response = await authMe();
          if (!cancelled && response?.success && response?.data) {
            setUser(response.data);
          } else {
            throw new Error('Failed to load user profile');
          }
        } catch (error) {
          try {
            const synced = await syncFirebaseUser(firebaseUser);
            if (!cancelled) setUser(synced);
          } catch (syncError) {
            console.error('Failed to sync Firebase user', syncError);
            if (!cancelled) setUser(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      });

      return unsubscribe;
    };

    let unsubscribe;
    init().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const synced = await syncFirebaseUser(result.user);
    setUser(synced);
    return synced;
  };

  const signup = async (name, email, password, _phone) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateFirebaseProfile(result.user, { displayName: name });
      await result.user.getIdToken(true);
    }
    const synced = await syncFirebaseUser(result.user);
    setUser(synced);
    return synced;
  };

  const loginWithGoogle = () => {
    // Use redirect instead of popup to avoid browser popup blockers
    signInWithRedirect(auth, googleProvider);
  };

  const loginWithFacebook = async () => {
    throw new Error('Facebook login is not configured. Use Google sign-in.');
  };

  const sendOtp = async () => {
    throw new Error('Phone OTP login is not configured. Use Google sign-in.');
  };

  const verifyOtp = async () => {
    throw new Error('Phone OTP login is not configured. Use Google sign-in.');
  };

  const updateProfile = async (updates) => {
    const response = await authUpdateProfile(updates);
    if (!response?.success || !response?.data) {
      throw new Error(response?.message || 'Failed to update profile');
    }
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    sendOtp,
    verifyOtp,
    updateProfile
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
