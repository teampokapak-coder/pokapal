/**
 * firebase/auth/cordova expects Cordova APIs (BuildInfo, browsertab, universalLinks, InAppBrowser).
 * Capacitor does not ship those; this maps them to @capacitor/app + @capacitor/browser so
 * signInWithRedirect can open OAuth and appUrlOpen can deliver the callback URL to Firebase.
 */
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'

const IOS_BUNDLE_ID = 'com.pokapal.pulltcg'

const universalLinkCallbacks = []

function install() {
  if (typeof window === 'undefined') return
  if (!Capacitor.isNativePlatform()) return
  if (window.__pullCordovaFirebaseShim) return
  window.__pullCordovaFirebaseShim = true

  window.BuildInfo = window.BuildInfo || {
    packageName: IOS_BUNDLE_ID,
    displayName: 'Pull TCG'
  }

  window.universalLinks = window.universalLinks || {
    subscribe(_ignore, callback) {
      if (typeof callback === 'function') universalLinkCallbacks.push(callback)
    }
  }

  window.cordova = window.cordova || {}
  window.cordova.plugins = window.cordova.plugins || {}
  window.cordova.plugins.browsertab = {
    isAvailable(cb) {
      queueMicrotask(() => cb(true))
    },
    openUrl(url) {
      void Browser.open({ url })
    },
    close() {
      void Browser.close().catch(() => {})
    }
  }

  window.cordova.InAppBrowser = {
    open(url) {
      void Browser.open({ url })
      return {
        close: () => {
          void Browser.close().catch(() => {})
        }
      }
    }
  }

  void App.addListener('appUrlOpen', ({ url }) => {
    const eventData = { url }
    for (const cb of universalLinkCallbacks) {
      try {
        cb(eventData)
      } catch (e) {
        console.error('[cordovaFirebaseShim] universalLinks', e)
      }
    }
  })
}

install()
