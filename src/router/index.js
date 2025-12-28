import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
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
  routes
})

// Wait for auth to initialize
const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Route guards - protect admin routes
router.beforeEach(async (to, from, next) => {
  const isAdminRoute = to.path.startsWith('/admin')
  
  if (isAdminRoute) {
    // Wait for auth state to be determined
    const user = await waitForAuth()
    
    if (!user) {
      // Not logged in, redirect to login
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      // Logged in, allow access
      next()
    }
  } else {
    next()
  }
})

export default router

