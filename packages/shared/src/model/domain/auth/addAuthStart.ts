import z from 'zod'
import { UserIdSchema } from '@/model/domain/user.ts'
import { AuthMethodSchema } from '@/model/domain/auth.ts'
import { RegistrationStart } from '@/model/domain/auth/registrationStart.ts'

export namespace AddAuthStart {
  export const ConcreteInputDtoSchema = z.object({
    userId: UserIdSchema,
    method: AuthMethodSchema,
  })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>

  export const ConcreteResultDtoSchema =
    RegistrationStart.ClientResponseDtoSchema
  export type ConcreteResultDto = z.Infer<typeof ConcreteResultDtoSchema>
}
