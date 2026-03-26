import { Capacitor } from '@capacitor/core'

/**
 * True in Capacitor iOS/Android WebViews. Prefer this over window.Capacitor — the router may run
 * before the global is attached, which previously skipped the native login gate.
 * Set VITE_FORCE_NATIVE_SHELL=true to preview the app shell in a desktop browser.
 */
export function getIsNativeApp() {
  if (import.meta.env.VITE_FORCE_NATIVE_SHELL === 'true') return true
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

/** True only on real Capacitor iOS/Android (not VITE_FORCE_NATIVE_SHELL in desktop). Firebase Google uses Cordova auth here. */
export function getIsCapacitorNative() {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}
