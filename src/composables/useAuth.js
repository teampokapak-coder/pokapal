// Authentication Composable
import { ref } from 'vue'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

// Shared state
const user = ref(null)
const loading = ref(true)
const error = ref(null)

// Initialize auth state listener (call once)
let authInitialized = false

export const useAuth = () => {
  // Initialize auth listener on first use
  if (!authInitialized) {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
    authInitialized = true
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
    logout,
    resetPassword
  }
}

