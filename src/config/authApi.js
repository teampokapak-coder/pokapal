/**
 * Capacitor uses firebase/auth/cordova for Auth instance + redirect. Calling onAuthStateChanged,
 * getRedirectResult, etc. from firebase/auth with that instance throws auth/argument-error.
 * Always import auth helpers from here when the first argument is `auth` from ./firebase.
 */
import { getIsCapacitorNative } from '../app/composables/useIsNativeApp'
import * as webAuth from 'firebase/auth'
import * as cordovaAuth from 'firebase/auth/cordova'

const api = getIsCapacitorNative() ? cordovaAuth : webAuth

export const onAuthStateChanged = api.onAuthStateChanged
export const createUserWithEmailAndPassword = api.createUserWithEmailAndPassword
export const signInWithEmailAndPassword = api.signInWithEmailAndPassword
export const signOut = api.signOut
export const updateProfile = api.updateProfile
export const sendPasswordResetEmail = api.sendPasswordResetEmail
export const GoogleAuthProvider = api.GoogleAuthProvider
export const getRedirectResult = api.getRedirectResult
export const signInWithRedirect = api.signInWithRedirect

/** Not supported on Cordova auth; only call when !getIsCapacitorNative(). */
export { signInWithPopup } from 'firebase/auth'
