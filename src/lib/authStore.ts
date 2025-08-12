import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-form'
import { useCallback } from 'react'

const store = new Store({
  accessToken: null as string | null,
})

store.subscribe((state) => {
  console.log('Access token updated:', state.currentVal.accessToken)
})

export function setAccessToken(token: string | null) {
  store.setState(() => ({
    accessToken: token,
  }))
}

export function clearAccessToken() {
  store.setState(() => ({
    accessToken: null,
  }))
}

export function useAccessToken() {
  const accessToken = useStore(store, (state) => state.accessToken)
  return useCallback(() => {
    if (!accessToken) {
      throw new Error('Access token is not set')
    }
    return accessToken
  }, [accessToken])
}

export function getAccessToken() {
  const accessToken = store.state.accessToken
  if (!accessToken) {
    throw new Error('Access token is not set')
  }
  return accessToken
}
