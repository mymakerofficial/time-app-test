import { Store } from '@tanstack/store'

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
    throw new Error('Access token is not set')
  }
  return accessToken
}

function getUserId() {
  const userId = store.state.userId
  if (!userId) {
    throw new Error('User is not set')
  }
  return userId
}

function getEncryptionKey() {
  const encryptionKey = store.state.encryptionKey
  if (!encryptionKey) {
    throw new Error('Encryption key is not set')
  }
  return encryptionKey
}

export function useSession(): SessionContext {
  // TODO if access token is not set we need to refresh it
  return {
    getAccessToken,
    getUserId,
    getEncryptionKey,
    getUserIdSafe: () => store.state.userId,
  }
}
