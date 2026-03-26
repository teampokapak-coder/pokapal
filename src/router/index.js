import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../config/firebase'
import { onAuthStateChanged } from '../config/authApi'
import { getIsNativeApp } from '../app/composables/useIsNativeApp'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/start',
    name: 'StartMasterSet',
    component: () => import('../views/StartMasterSet.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('../views/Profile.vue') // Redirect to profile
  },
  {
    path: '/challenge/:challengeId',
    name: 'ChallengeDetails',
    component: () => import('../views/ChallengeDetails.vue')
  },
  {
    path: '/master-set/:masterSetId',
    name: 'MasterSetDetails',
    component: () => import('../views/ChallengeDetails.vue') // Reuse ChallengeDetails for now
  },
  {
    path: '/browse',
    name: 'BrowseCards',
    component: () => import('../views/BrowseCards.vue')
  },
  {
    path: '/pokemon',
    name: 'BrowsePokemon',
    component: () => import('../views/BrowsePokemon.vue')
  },
  {
    path: '/pokemon/:pokemonId',
    name: 'PokemonDetail',
    component: () => import('../views/PokemonDetail.vue')
  },
  {
    path: '/trainers',
    name: 'BrowseTrainers',
    component: () => import('../views/BrowseTrainers.vue')
  },
  {
    path: '/trainer/:trainerId',
    name: 'TrainerDetail',
    component: () => import('../views/TrainerDetail.vue')
  },
  {
    path: '/set/:setId',
    name: 'SetDetail',
    component: () => import('../views/SetDetail.vue')
  },
  {
    path: '/sets',
    name: 'AllSets',
    component: () => import('../views/AllSets.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminSimplified.vue')
  },
  {
    path: '/admin/pokemon',
    name: 'AdminPokemon',
    component: () => import('../views/AdminPokemon.vue')
  },
  {
    path: '/admin/sets',
    name: 'AdminSets',
    component: () => import('../views/AdminSets.vue')
  },
  {
    path: '/admin/blog',
    name: 'AdminBlog',
    component: () => import('../views/AdminBlog.vue')
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('../views/BlogList.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('../views/BlogDetail.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, left: 0 }
  },
})

/** Native shell scrolls `<main>`, not `window` — reset it on every navigation. */
router.afterEach(() => {
  if (typeof document === 'undefined') return
  if (!getIsNativeApp()) return
  const main = document.querySelector('.mobile-shell main')
  if (main) main.scrollTop = 0
})

const AUTH_GUARD_TIMEOUT_MS = 6000

// Wait for auth to initialize (first onAuthStateChanged). WKWebView / bad config can stall the listener
// forever; never block router.isReady() or the app will never mount and the splash never clears.
const waitForAuth = () => {
  return new Promise((resolve) => {
    let settled = false
    let unsubscribe = () => {}
    const finish = (firebaseUser) => {
      if (settled) return
      settled = true
      unsubscribe()
      resolve(firebaseUser ?? null)
    }
    unsubscribe = onAuthStateChanged(auth, (user) => {
      finish(user)
    })
    setTimeout(() => finish(auth.currentUser), AUTH_GUARD_TIMEOUT_MS)
  })
}

// Route guards: admin (web + app), and full app shell requires sign-in first
router.beforeEach(async (to, from, next) => {
  const isLoginRoute = to.path === '/login'
  const isAdminRoute = to.path.startsWith('/admin')
  const isNativeShell = getIsNativeApp()

  const requiresAuth =
    isAdminRoute || (isNativeShell && !isLoginRoute)

  if (requiresAuth) {
    const user = await waitForAuth()
    if (!user) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router

