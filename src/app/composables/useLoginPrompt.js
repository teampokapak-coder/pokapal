import { useRouter, useRoute } from 'vue-router'
import { getIsNativeApp } from './useIsNativeApp'

export const MASTER_SET_LOGIN_INTENT_KEY = 'pull-open-master-set'

/** After redirect login, open Start Master Set modal once. */
export function consumeMasterSetLoginIntent() {
  if (typeof sessionStorage === 'undefined') return false
  if (sessionStorage.getItem(MASTER_SET_LOGIN_INTENT_KEY) === '1') {
    sessionStorage.removeItem(MASTER_SET_LOGIN_INTENT_KEY)
    return true
  }
  return false
}

/**
 * In native app shell, navigate to full-screen login instead of LoginModal.
 * @param {{ forMasterSet?: boolean }} opts - set flag to open master-set flow after return
 * @returns true if navigation was triggered
 */
export function useLoginPrompt() {
  const router = useRouter()
  const route = useRoute()

  const requestLogin = (opts = {}) => {
    if (!getIsNativeApp()) return false
    if (opts.forMasterSet) sessionStorage.setItem(MASTER_SET_LOGIN_INTENT_KEY, '1')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return true
  }

  return { requestLogin }
}
