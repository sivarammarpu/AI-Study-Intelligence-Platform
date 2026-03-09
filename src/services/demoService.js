/**
 * Demo Mode Service
 * ─────────────────────────────────────────────────────────────────
 * When Firebase API keys are not configured (placeholder values),
 * this module provides full localStorage-based auth and data storage
 * so all features work immediately without any backend setup.
 */

const PLACEHOLDER = 'YOUR_FIREBASE';

export const isDemoMode = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY || '';
  return !key || key.startsWith(PLACEHOLDER) || key === '';
};

// ─── Demo Auth ─────────────────────────────────────────────────────
const USERS_KEY = 'studyai_demo_users';
const SESSION_KEY = 'studyai_demo_session';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const demoRegister = (email, password, name) => {
  return new Promise((resolve, reject) => {
    const users = getUsers();
    if (users[email]) {
      reject({ code: 'auth/email-already-in-use', message: 'An account with this email already exists.' });
      return;
    }
    const uid = 'demo_' + Date.now();
    const user = { uid, email, displayName: name, password, createdAt: new Date().toISOString() };
    users[email] = user;
    saveUsers(users);
    const session = { uid, email, displayName: name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    resolve({ user: session });
  });
};

export const demoLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const users = getUsers();
    const user = users[email];
    if (!user || user.password !== password) {
      reject({ code: 'auth/wrong-password', message: 'Invalid email or password.' });
      return;
    }
    const session = { uid: user.uid, email: user.email, displayName: user.displayName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    resolve({ user: session });
  });
};

export const demoGetCurrentUser = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const demoLogout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const demoUpdateProfile = (uid, displayName) => {
  const session = demoGetCurrentUser();
  if (session && session.uid === uid) {
    session.displayName = displayName;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Update in users store too
    const users = getUsers();
    const userEntry = Object.values(users).find(u => u.uid === uid);
    if (userEntry) {
      users[userEntry.email].displayName = displayName;
      saveUsers(users);
    }
  }
};

// ─── Demo Firestore (localStorage) ────────────────────────────────
const getCollection = (name) => JSON.parse(localStorage.getItem(`studyai_${name}`) || '[]');
const saveCollection = (name, data) => localStorage.setItem(`studyai_${name}`, JSON.stringify(data));

export const demoCreateUser = (uid, data) => {
  const col = getCollection('users');
  const existing = col.findIndex(u => u.uid === uid);
  const newUser = { uid, xp: 0, streak: 0, badges: [], createdAt: new Date().toISOString(), ...data };
  if (existing >= 0) col[existing] = { ...col[existing], ...data };
  else col.push(newUser);
  saveCollection('users', col);
};

export const demoGetUser = (uid) => {
  return getCollection('users').find(u => u.uid === uid) || null;
};

export const demoUpdateUser = (uid, data) => {
  const col = getCollection('users');
  const idx = col.findIndex(u => u.uid === uid);
  if (idx >= 0) col[idx] = { ...col[idx], ...data };
  saveCollection('users', col);
};

export const demoSaveSession = (uid, session) => {
  const col = getCollection('sessions');
  col.unshift({ id: 'sess_' + Date.now(), userId: uid, ...session, createdAt: new Date().toISOString() });
  saveCollection('sessions', col.slice(0, 100));
};

export const demoGetSessions = (uid) => {
  return getCollection('sessions').filter(s => s.userId === uid);
};

export const demoSaveFlashcards = (uid, topic, cards) => {
  const col = getCollection('flashcards');
  col.unshift({ id: 'fc_' + Date.now(), userId: uid, topic, cards, createdAt: new Date().toISOString() });
  saveCollection('flashcards', col);
};

export const demoGetFlashcards = (uid) => {
  return getCollection('flashcards').filter(f => f.userId === uid);
};

export const demoSaveAnalytics = (uid, data) => {
  const col = getCollection('analytics');
  col.unshift({ id: 'an_' + Date.now(), userId: uid, ...data, createdAt: new Date().toISOString() });
  saveCollection('analytics', col.slice(0, 200));
};

export const demoGetAnalytics = (uid) => {
  return getCollection('analytics').filter(a => a.userId === uid);
};

export const demoSaveCurriculum = (uid, curriculum) => {
  const col = getCollection('curriculum');
  col.unshift({ id: 'cur_' + Date.now(), userId: uid, ...curriculum, createdAt: new Date().toISOString() });
  saveCollection('curriculum', col);
};

export const demoGetCurricula = (uid) => {
  return getCollection('curriculum').filter(c => c.userId === uid);
};
