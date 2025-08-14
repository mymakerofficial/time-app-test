import { t } from 'elysia'

export namespace AuthModel {
  export const loginStartBody = t.Object({
    username: t.String(),
    clientPublicEphemeral: t.String(),
  })
  export type loginStartBody = typeof loginStartBody.static

  export const loginStartResponse = t.Object({
    userId: t.String(),
    salt: t.String(),
    serverPublicEphemeral: t.String(),
  })
  export type loginStartResponse = typeof loginStartResponse.static
}
