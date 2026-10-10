import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Toolzaro Official Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA8iqjs77GSmMjWwPKmYYB7nqaiUSqOVNA",
  authDomain: "toolzaro-56fe1.firebaseapp.com",
  projectId: "toolzaro-56fe1",
  storageBucket: "toolzaro-56fe1.firebasestorage.app",
  messagingSenderId: "146914394885",
  appId: "1:146914394885:web:69eaeac83d032383392d6c",
  measurementId: "G-MQPSEFQBYK"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore database for Toolzaro
export const db = getFirestore(app);
export const auth = getAuth(app);

// Attempt anonymous sign-in to satisfy authenticated Firestore rules if enabled
if (typeof window !== 'undefined') {
  try {
    signInAnonymously(auth).catch(() => {
      // Non-blocking: will continue with offline cache or open rules
    });
  } catch {}
}

export default app;
