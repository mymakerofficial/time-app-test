export const pendingRegistrations = new Map<string, { username: string }>()

export const pendingLogins = new Map<
  string,
  {
    serverSecretEphemeral: string
    clientPublicEphemeral: string
    salt: string
    verifier: string
  }
>()
