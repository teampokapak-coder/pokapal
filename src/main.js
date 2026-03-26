// Before Firebase loads: Cordova-shaped globals for firebase/auth/cordova on Capacitor
import './app/cordovaFirebaseShim.js'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import { initializePushNotifications, touchPushTokenSession } from './app/composables/usePushNotifications'

const app = createApp(App)
app.use(router)

// Initialize auth (just calling useAuth initializes the listener)
useAuth()

// Wait for the initial navigation (including beforeEach auth guard) before mounting
// so the WKWebView never paints Home for a frame before redirecting to /login.
router.isReady().then(() => {
  void initializePushNotifications(router)
  void touchPushTokenSession()
  app.mount('#app')
})
