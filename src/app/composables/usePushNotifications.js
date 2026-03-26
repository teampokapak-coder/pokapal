import { PushNotifications } from '@capacitor/push-notifications'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { getIsCapacitorNative } from './useIsNativeApp'

const TOKEN_STORAGE_KEY = 'pull_push_token'
const TOKEN_USER_STORAGE_KEY = 'pull_push_token_user'
const DEFAULT_ROUTE = '/profile'
const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000

let initialized = false
let currentToken = null
let currentUserId = null
let routerRef = null
let listeners = []

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

const setStoredToken = (token) => {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    return
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

const getStoredTokenUser = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_USER_STORAGE_KEY)
}

const setStoredTokenUser = (userId) => {
  if (typeof window === 'undefined') return
  if (userId) {
    localStorage.setItem(TOKEN_USER_STORAGE_KEY, userId)
    return
  }
  localStorage.removeItem(TOKEN_USER_STORAGE_KEY)
}

const toTokenDocId = (token) => encodeURIComponent(token).replace(/%/g, '_')

const getDeepLinkRoute = (notificationData = {}) => {
  const rawRoute = typeof notificationData.route === 'string' ? notificationData.route : ''
  if (rawRoute.startsWith('/')) return rawRoute

  const challengeId = notificationData.challengeId || notificationData.masterSetId
  if (challengeId) return `/master-set/${challengeId}`
  return DEFAULT_ROUTE
}

const upsertPushToken = async (userId, token) => {
  if (!userId || !token) return
  const tokenRef = doc(db, 'users', userId, 'pushTokens', toTokenDocId(token))
  await setDoc(tokenRef, {
    token,
    platform: 'ios',
    updatedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp()
  }, { merge: true })
}

const removePushToken = async (userId, token) => {
  if (!userId || !token) return
  const tokenRef = doc(db, 'users', userId, 'pushTokens', toTokenDocId(token))
  await deleteDoc(tokenRef)
}

const upsertDefaultNotificationPreferences = async (userId) => {
  if (!userId) return
  await setDoc(doc(db, 'users', userId), {
    notifications: {
      invitesEnabled: true,
      challengeUpdatesEnabled: true
    }
  }, { merge: true })
}

const onRegistration = async (tokenValue) => {
  currentToken = tokenValue
  setStoredToken(tokenValue)

  if (!currentUserId) return
  try {
    await upsertPushToken(currentUserId, tokenValue)
    setStoredTokenUser(currentUserId)
  } catch (error) {
    console.error('[push] failed to upsert token:', error)
  }
}

const onNotificationAction = async (notification) => {
  const route = getDeepLinkRoute(notification?.notification?.data || {})
  if (!routerRef) return
  try {
    await routerRef.push(route)
  } catch (error) {
    console.error('[push] failed to route from notification:', error)
  }
}

export const initializePushNotifications = async (router) => {
  if (initialized) return
  if (!getIsCapacitorNative()) return
  if (typeof window === 'undefined') return

  initialized = true
  routerRef = router
  currentToken = getStoredToken()

  listeners.push(await PushNotifications.addListener('registration', (token) => {
    void onRegistration(token.value)
  }))
  listeners.push(await PushNotifications.addListener('registrationError', (error) => {
    console.error('[push] registration error:', error)
  }))
  listeners.push(await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    void onNotificationAction(notification)
  }))

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') {
    console.warn('[push] permission not granted')
    return
  }

  await PushNotifications.register()
}

export const syncPushNotificationsForUser = async (firebaseUser) => {
  if (!getIsCapacitorNative()) return
  if (typeof window === 'undefined') return

  const nextUserId = firebaseUser?.uid || null
  const previousUserId = currentUserId || getStoredTokenUser()
  const token = currentToken || getStoredToken()
  currentUserId = nextUserId

  if (!nextUserId) {
    if (previousUserId && token) {
      try {
        await removePushToken(previousUserId, token)
      } catch (error) {
        console.error('[push] failed removing token on logout:', error)
      }
    }
    setStoredTokenUser(null)
    return
  }

  try {
    await upsertDefaultNotificationPreferences(nextUserId)
  } catch (error) {
    console.error('[push] failed ensuring notification preferences:', error)
  }

  if (token) {
    try {
      await upsertPushToken(nextUserId, token)
      setStoredTokenUser(nextUserId)
    } catch (error) {
      console.error('[push] failed syncing push token:', error)
    }
  }
}

export const touchPushTokenSession = async () => {
  if (!currentUserId || !currentToken) return
  const lastUpdated = Number(localStorage.getItem('pull_push_last_touch') || '0')
  const now = Date.now()
  if (now - lastUpdated < UPDATE_INTERVAL_MS) return

  try {
    await upsertPushToken(currentUserId, currentToken)
    localStorage.setItem('pull_push_last_touch', String(now))
  } catch (error) {
    console.error('[push] failed refreshing token heartbeat:', error)
  }
}

export const disposePushNotifications = async () => {
  for (const listener of listeners) {
    try {
      await listener.remove()
    } catch {
      // noop
    }
  }
  listeners = []
  initialized = false
}
