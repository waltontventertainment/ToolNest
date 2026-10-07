import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();
// Workspace Drive Scope
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (NEVER saved in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

/**
 * Listener for Auth State changes.
 */
export const initAuthListener = (
  onStateChange: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      onStateChange(user, cachedAccessToken);
    } else if (user && !isSigningIn) {
      // If user is logged in via Firebase session but token expired in memory,
      // token will be retrieved during explicit user interaction or re-login.
      onStateChange(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onStateChange(null, null);
    }
  });
};

/**
 * Triggers Google Sign In popup and returns User + AccessToken.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token from Google authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' || 
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      // User closed the popup window intentionally before completing authentication
      return null;
    }
    console.error('Google Auth error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns current cached access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Signs out from Firebase and resets in-memory access token.
 */
export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};
