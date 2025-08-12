export const pendingRegistrations = new Map<string, { username: string }>()

export const pendingLogins = new Map<
  string,
  { serverSecret: string; clientPublic: string; salt: string; verifier: string }
>()
