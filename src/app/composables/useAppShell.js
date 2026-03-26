import { computed } from 'vue'
import { getIsNativeApp } from './useIsNativeApp'

/** Reactive app-shell flag (Capacitor or VITE_FORCE_NATIVE_SHELL). */
export function useAppShell() {
  return {
    isAppShell: computed(() => getIsNativeApp())
  }
}
