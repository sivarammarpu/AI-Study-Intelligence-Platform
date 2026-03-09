import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc,
  getDocs, query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  isDemoMode,
  demoCreateUser, demoGetUser, demoUpdateUser,
  demoSaveSession, demoGetSessions,
  demoSaveFlashcards, demoGetFlashcards,
  demoSaveAnalytics, demoGetAnalytics,
  demoSaveCurriculum, demoGetCurricula,
} from './demoService';

const demo = isDemoMode();

// ─── Users ─────────────────────────────────────────────────────────
export const createUser = async (uid, data) => {
  if (demo) return demoCreateUser(uid, data);
  await setDoc(doc(db, 'users', uid), {
    ...data, xp: 0, streak: 0, badges: [], createdAt: serverTimestamp(),
  }, { merge: true });
};

export const getUser = async (uid) => {
  if (demo) return demoGetUser(uid);
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUser = async (uid, data) => {
  if (demo) return demoUpdateUser(uid, data);
  await updateDoc(doc(db, 'users', uid), data);
};

// ─── Study Sessions ─────────────────────────────────────────────────
export const saveSession = async (uid, session) => {
  if (demo) return demoSaveSession(uid, session);
  return await addDoc(collection(db, 'study_sessions'), {
    userId: uid, ...session, createdAt: serverTimestamp(),
  });
};

export const getSessions = async (uid) => {
  if (demo) return demoGetSessions(uid);
  const q = query(
    collection(db, 'study_sessions'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Flashcards ─────────────────────────────────────────────────────
export const saveFlashcards = async (uid, topic, cards) => {
  if (demo) return demoSaveFlashcards(uid, topic, cards);
  return await addDoc(collection(db, 'flashcards'), {
    userId: uid, topic, cards, createdAt: serverTimestamp(),
  });
};

export const getFlashcards = async (uid) => {
  if (demo) return demoGetFlashcards(uid);
  const q = query(collection(db, 'flashcards'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Analytics ──────────────────────────────────────────────────────
export const saveAnalytics = async (uid, data) => {
  if (demo) return demoSaveAnalytics(uid, data);
  return await addDoc(collection(db, 'analytics'), {
    userId: uid, ...data, createdAt: serverTimestamp(),
  });
};

export const getAnalytics = async (uid) => {
  if (demo) return demoGetAnalytics(uid);
  const q = query(collection(db, 'analytics'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Curriculum ─────────────────────────────────────────────────────
export const saveCurriculum = async (uid, curriculum) => {
  if (demo) return demoSaveCurriculum(uid, curriculum);
  return await addDoc(collection(db, 'curriculum'), {
    userId: uid, ...curriculum, createdAt: serverTimestamp(),
  });
};

export const getCurricula = async (uid) => {
  if (demo) return demoGetCurricula(uid);
  const q = query(collection(db, 'curriculum'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
