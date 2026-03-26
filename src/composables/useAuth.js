// Authentication Composable
import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signInWithRedirect
} from '../config/authApi'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { getIsCapacitorNative } from '../app/composables/useIsNativeApp'

// Shared state
const user = ref(null)
const loading = ref(true)
const error = ref(null)

// Initialize auth state listener (call once)
let authInitialized = false

async function ensureUserDoc(firebaseUser) {
  if (!firebaseUser?.uid) return
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      groups: [],
      collections: [],
      isAdmin: false
    })
  }
}

export const useAuth = () => {
  if (!authInitialized) {
    authInitialized = true
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) await ensureUserDoc(result.user)
      })
      .catch(() => {})
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
    // WKWebView / first launch can delay the first callback; never block the app forever
    const AUTH_LOADING_FALLBACK_MS = 5000
    setTimeout(() => {
      if (loading.value) {
        // If the listener never ran, still align with whatever the SDK persisted
        user.value = auth.currentUser
        loading.value = false
      }
    }, AUTH_LOADING_FALLBACK_MS)
  }
  // Register new user
  const register = async (email, password, displayName) => {
    try {
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        groups: [],
        collections: [],
        isAdmin: false
      })
      
      return { success: true, user: userCredential.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Login
  const login = async (email, password) => {
    try {
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Real Capacitor: firebase/auth/cordova (SFSafariViewController-style redirect). Plain browser auth + redirect
  // often never completes in WKWebView. Desktop web / VITE_FORCE_NATIVE_SHELL: popup.
  const loginWithGoogle = async () => {
    try {
      error.value = null
      const provider = new GoogleAuthProvider()
      if (getIsCapacitorNative()) {
        const REDIRECT_START_MS = 25000
        try {
          await Promise.race([
            signInWithRedirect(auth, provider),
            new Promise((_, reject) => {
              setTimeout(() => {
                reject(
                  new Error(
                    'Google sign-in did not open. Confirm URL scheme in Info.plist matches REVERSED_CLIENT_ID, rebuild the iOS app, and check Safari → Develop → Simulator → Pull TCG for errors.'
                  )
                )
              }, REDIRECT_START_MS)
            })
          ])
        } catch (err) {
          const code = err?.code ?? ''
          const msg = err?.message || code || String(err)
          console.warn('[loginWithGoogle] Cordova redirect failed', code, err)
          error.value = msg
          return { success: false, error: msg }
        }
        return { success: false, redirectStarted: true }
      }
      const userCredential = await signInWithPopup(auth, provider)
      await ensureUserDoc(userCredential.user)
      return { success: true, user: userCredential.user }
    } catch (err) {
      const msg = err?.message || err?.code || String(err)
      console.warn('[loginWithGoogle]', err?.code, err)
      error.value = msg
      return { success: false, error: msg }
    }
  }

  // Logout
  const logout = async () => {
    try {
      error.value = null
      await signOut(auth)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      error.value = null
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  return {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  }
}

