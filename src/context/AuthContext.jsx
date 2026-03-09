import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser, getUser } from '../services/firestoreService';
import {
  isDemoMode,
  demoRegister,
  demoLogin,
  demoLogout,
  demoGetCurrentUser,
  demoCreateUser,
  demoGetUser,
  demoUpdateProfile,
} from '../services/demoService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
const googleProvider = new GoogleAuthProvider();
const DEMO = isDemoMode();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Session Initialization ───────────────────────────────────────
  useEffect(() => {
    if (DEMO) {
      // Restore from localStorage session
      const session = demoGetCurrentUser();
      if (session) {
        setCurrentUser(session);
        setUserData(demoGetUser(session.uid));
      }
      setLoading(false);
      return;
    }
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const data = await getUser(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Register ─────────────────────────────────────────────────────
  const register = useCallback(async (email, password, name) => {
    if (DEMO) {
      const result = await demoRegister(email, password, name);
      demoCreateUser(result.user.uid, { name, email, uid: result.user.uid });
      setCurrentUser(result.user);
      setUserData(demoGetUser(result.user.uid));
      return result;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUser(result.user.uid, { name, email, uid: result.user.uid });
    return result;
  }, []);

  // ─── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    if (DEMO) {
      const result = await demoLogin(email, password);
      setCurrentUser(result.user);
      setUserData(demoGetUser(result.user.uid));
      return result;
    }
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  // ─── Google Login ─────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    if (DEMO) {
      const uid = 'demo_google_' + Math.random().toString(36).slice(2, 8);
      const mockUser = { uid, email: 'demo@google.com', displayName: 'Demo User' };
      localStorage.setItem('studyai_demo_session', JSON.stringify(mockUser));
      demoCreateUser(uid, { name: 'Demo User', email: 'demo@google.com', uid });
      setCurrentUser(mockUser);
      setUserData(demoGetUser(uid));
      return { user: mockUser };
    }
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const existing = await getUser(user.uid);
    if (!existing) await createUser(user.uid, { name: user.displayName, email: user.email, uid: user.uid });
    return result;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    if (DEMO) {
      demoLogout();
      setCurrentUser(null);
      setUserData(null);
      return;
    }
    return signOut(auth);
  }, []);

  // ─── Refresh / Update ─────────────────────────────────────────────
  const refreshUserData = useCallback(async (uid) => {
    const data = DEMO ? demoGetUser(uid) : await getUser(uid);
    setUserData(data);
  }, []);

  const updateUserProfile = useCallback(async (displayName) => {
    if (!currentUser) return;
    if (DEMO) {
      demoUpdateProfile(currentUser.uid, displayName);
    } else {
      await updateProfile(auth.currentUser, { displayName });
    }
    setCurrentUser(prev => ({ ...prev, displayName }));
    await refreshUserData(currentUser.uid);
  }, [currentUser, refreshUserData]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      userData,
      loading,
      demo: DEMO,
      register,
      login,
      loginWithGoogle,
      logout,
      refreshUserData,
      updateUserProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
