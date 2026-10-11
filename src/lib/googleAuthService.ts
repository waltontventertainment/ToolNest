import type { User } from 'firebase/auth';

// In-memory access token cache (NEVER saved in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

let authDepsPromise: Promise<{
  signInWithPopup: typeof import('firebase/auth').signInWithPopup;
  GoogleAuthProvider: typeof import('firebase/auth').GoogleAuthProvider;
  onAuthStateChanged: typeof import('firebase/auth').onAuthStateChanged;
  signOut: typeof import('firebase/auth').signOut;
  auth: typeof import('./firebase').auth;
  provider: InstanceType<typeof import('firebase/auth').GoogleAuthProvider>;
}> | null = null;

function loadAuthDeps() {
  if (!authDepsPromise) {
    authDepsPromise = Promise.all([
      import('firebase/auth'),
      import('./firebase'),
    ]).then(([authMod, fbMod]) => {
      const provider = new authMod.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      return {
        signInWithPopup: authMod.signInWithPopup,
        GoogleAuthProvider: authMod.GoogleAuthProvider,
        onAuthStateChanged: authMod.onAuthStateChanged,
        signOut: authMod.signOut,
        auth: fbMod.auth,
        provider,
      };
    });
  }
  return authDepsPromise;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

/**
 * Listener for Auth State changes (loads Firebase Auth lazily so initial FCP/LCP is never blocked).
 */
export const initAuthListener = (
  onStateChange: (user: User | null, token: string | null) => void
) => {
  let cancelled = false;
  let unsub: (() => void) | null = null;

  loadAuthDeps()
    .then(({ onAuthStateChanged, auth }) => {
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, async (user: User | null) => {
        if (user && cachedAccessToken) {
          onStateChange(user, cachedAccessToken);
        } else if (user && !isSigningIn) {
          onStateChange(user, cachedAccessToken);
        } else {
          cachedAccessToken = null;
          onStateChange(null, null);
        }
      });
    })
    .catch(() => {
      if (!cancelled) onStateChange(null, null);
    });

  return () => {
    cancelled = true;
    if (unsub) unsub();
  };
};

/**
 * Triggers Google Sign In popup and returns User + AccessToken.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const { signInWithPopup, GoogleAuthProvider, auth, provider } = await loadAuthDeps();
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
  const { signOut, auth } = await loadAuthDeps();
  await signOut(auth);
  cachedAccessToken = null;
};
