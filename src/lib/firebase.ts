import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Toolzaro Firebase Configuration loaded from environment variables or provisioned firebase-applet-config.json
export const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId || undefined,
};

let _app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

// Lazy App Proxy
export const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    const inst = getFirebaseApp();
    const val = (inst as any)[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  }
});

let _db: Firestore | null = null;
export function getFirebaseDb(): Firestore {
  if (!_db) {
    const appInstance = getFirebaseApp();
    // Dynamic import pattern or cached getFirestore
    const { getFirestore } = require ? { getFirestore: (a: any, d?: any) => (window as any).__firebase_firestore || null } : {} as any;
    try {
      // In bundled ES modules, we load getFirestore dynamically or synchronously if available
      const fsMod = (window as any).__fsMod;
      if (fsMod && fsMod.getFirestore) {
        _db = firebaseConfigJson.firestoreDatabaseId
          ? fsMod.getFirestore(appInstance, firebaseConfigJson.firestoreDatabaseId)
          : fsMod.getFirestore(appInstance);
      }
    } catch {}
  }
  return _db as Firestore;
}

// Full async / lazy DB accessor to ensure zero network and zero execution on initial page load
let _lazyDbPromise: Promise<Firestore> | null = null;
export async function getLazyDb(): Promise<Firestore> {
  if (_db) return _db;
  if (!_lazyDbPromise) {
    _lazyDbPromise = import('firebase/firestore').then(fsMod => {
      const appInstance = getFirebaseApp();
      _db = firebaseConfigJson.firestoreDatabaseId
        ? fsMod.getFirestore(appInstance, firebaseConfigJson.firestoreDatabaseId)
        : fsMod.getFirestore(appInstance);
      return _db;
    });
  }
  return _lazyDbPromise;
}

// Lazy Firestore Proxy for backward compatibility with existing imports
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) {
      // If accessed synchronously before async load, initialize synchronously via dynamic require/import cache
      const appInstance = getFirebaseApp();
      try {
        const { getFirestore } = (window as any).__firebaseFs || {};
        if (getFirestore) {
          _db = firebaseConfigJson.firestoreDatabaseId
            ? getFirestore(appInstance, firebaseConfigJson.firestoreDatabaseId)
            : getFirestore(appInstance);
        }
      } catch {}
    }
    if (!_db) return undefined;
    const val = (_db as any)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  }
});

let _auth: Auth | null = null;
export async function getLazyAuth(): Promise<Auth> {
  if (_auth) return _auth;
  const authMod = await import('firebase/auth');
  const appInstance = getFirebaseApp();
  _auth = authMod.getAuth(appInstance);
  return _auth;
}

// Lazy Auth Proxy
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) {
      return undefined;
    }
    const val = (_auth as any)[prop];
    return typeof val === 'function' ? val.bind(_auth) : val;
  }
});

export default app;



