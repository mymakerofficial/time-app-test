import { t } from 'elysia'

export namespace AuthModel {
  export const RegisterStartBody = t.Object({
    username: t.String({
      minLength: 1,
    }),
  })
  export type RegisterStartBody = typeof RegisterStartBody.static

  export const RegisterStartResponse = t.Object({
    userId: t.String({
      minLength: 1,
    }),
  })
  export type RegisterStartResponse = typeof RegisterStartResponse.static

  export const RegisterFinishBody = t.Object({
    username: t.String({
      minLength: 1,
    }),
    userId: t.String({
      minLength: 1,
    }),
    salt: t.String({
      minLength: 1,
    }),
    verifier: t.String({
      minLength: 1,
    }),
  })
  export type RegisterFinishBody = typeof RegisterFinishBody.static

  export const LoginStartBody = t.Object({
    username: t.String({
      minLength: 1,
    }),
    clientPublicEphemeral: t.String({
      minLength: 1,
    }),
  })
  export type LoginStartBody = typeof LoginStartBody.static

  export const LoginStartResponse = t.Object({
    userId: t.String({
      minLength: 1,
    }),
    salt: t.String({
      minLength: 1,
    }),
    serverPublicEphemeral: t.String({
      minLength: 1,
    }),
  })
  export type LoginStartResponse = typeof LoginStartResponse.static

  export const LoginFinishBody = t.Object({
    userId: t.String({
      minLength: 1,
    }),
    clientProof: t.String({
      minLength: 1,
    }),
  })
  export type LoginFinishBody = typeof LoginFinishBody.static

  export const LoginFinishResponse = t.Object({
    serverProof: t.String({
      minLength: 1,
    }),
    accessToken: t.String({
      minLength: 1,
    }),
  })
  export type LoginFinishResponse = typeof LoginFinishResponse.static
}
