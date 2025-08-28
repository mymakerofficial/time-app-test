import { Store } from '@tanstack/store'

interface SessionStore {
  accessToken: string | null
  encryptionKey: CryptoKey | null
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

export function getAccessToken() {
  const accessToken = store.state.accessToken
  if (!accessToken) {
    throw new Error('Access token is not set')
  }
  return accessToken
}

export function useAccessToken() {
  // TODO if access token is not set we need to refresh it
  return getAccessToken
}

export function getEncryptionKey() {
  const encryptionKey = store.state.encryptionKey
  if (!encryptionKey) {
    throw new Error('Encryption key is not set')
  }
  return encryptionKey
}

export function useEncryptionKey() {
  return getEncryptionKey
}
