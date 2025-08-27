import { UserSchema } from '@/model/domain/user.ts'
import { stringToDate } from '@/zod.ts'

export const GetUsersMeResponse = UserSchema.extend({
  createdAt: stringToDate,
  updatedAt: stringToDate,
})
