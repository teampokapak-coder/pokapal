// Admin Check Composable
import { ref, watch } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'

export const useAdmin = () => {
  const { user } = useAuth()
  const isAdmin = ref(false)
  const loading = ref(true)

  const checkAdminStatus = async () => {
    if (!user.value) {
      isAdmin.value = false
      loading.value = false
      return
    }

    loading.value = true
    try {
      const userDoc = await getDoc(doc(db, 'users', user.value.uid))
      if (userDoc.exists()) {
        isAdmin.value = userDoc.data().isAdmin === true
      } else {
        isAdmin.value = false
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      isAdmin.value = false
    } finally {
      loading.value = false
    }
  }

  // Check admin status when user changes
  watch(user, () => {
    checkAdminStatus()
  }, { immediate: true })

  return {
    isAdmin,
    loading,
    checkAdminStatus
  }
}

