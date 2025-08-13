import { Store } from '@tanstack/store'

const store = new Store({
  accessToken: null as string | null,
})

export function setAccessToken(token: string | null) {
  store.setState(() => ({
    accessToken: token,
  }))
}

export function useSetAccessToken() {
  // TODO the access token changed, queries should be rerun
  return setAccessToken
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
