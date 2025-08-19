import { t } from 'elysia'

export namespace UsersModel {
  export const MeResponse = t.Object({
    id: t.String(),
    username: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  })
  export type MeResponse = typeof MeResponse.static
}
