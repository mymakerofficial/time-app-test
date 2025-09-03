import {
  RegistrationFinishInput,
  RegistrationFinishSuccessDto,
  RegistrationStartInput,
  RegistrationStartSuccessDto,
} from '@time-app-test/shared/model/domain/auth.ts'

export interface AuthStrategy {
  registerStart(
    data: RegistrationStartInput,
  ): Promise<RegistrationStartSuccessDto>
  registerFinish(
    data: RegistrationFinishInput,
  ): Promise<RegistrationFinishSuccessDto>
}
