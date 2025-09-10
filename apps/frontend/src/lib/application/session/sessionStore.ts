import { Store } from '@tanstack/store'
import { SessionNotSet } from '@time-app-test/shared/error/errors.ts'

interface SessionStore {
  accessToken: string | null
  userId: string | null
  encryptionKey: CryptoKey | null
}

export interface SessionContext {
  getAccessToken: () => string
  getUserId: () => string
  getUserIdSafe: () => string | null
  getEncryptionKey: () => CryptoKey
}

const store = new Store({
  accessToken: null,
  encryptionKey: null,
} as SessionStore)

export function setState(state: SessionStore) {
  store.setState(() => state)
}

export function useSetSession() {
  // TODO the access token changed, queries should be rerun
  return setState
}

function getAccessToken() {
  const accessToken = store.state.accessToken
  if (!accessToken) {
    throw SessionNotSet()
  }
  return accessToken
}

function getUserId() {
  const userId = store.state.userId
  if (!userId) {
    throw SessionNotSet()
  }
  return userId
}

function getEncryptionKey() {
  const encryptionKey = store.state.encryptionKey
  if (!encryptionKey) {
    throw SessionNotSet()
  }
  return encryptionKey
}

export function getSessionContext(): SessionContext {
  return {
    getAccessToken,
    getUserId,
    getEncryptionKey,
    getUserIdSafe: () => store.state.userId,
  }
}

export function useSession(): SessionContext {
  return getSessionContext()
}
