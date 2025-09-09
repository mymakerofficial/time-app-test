import z from 'zod'
import { RegistrationFinish } from '@/model/domain/auth/registrationFinish.ts'

export namespace AddAuthFinish {
  export const ConcreteInputDtoSchema =
    RegistrationFinish.ConcreteInputDtoSchema.omit({
      username: true,
    })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>
}
