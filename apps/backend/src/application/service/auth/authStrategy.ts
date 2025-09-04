import {
  RegistrationStartInput,
  RegistrationStartSuccessDto,
} from '@time-app-test/shared/model/domain/auth/registrationStart.ts'
import {
  RegistrationFinishInput,
  RegistrationFinishSuccessDto,
} from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'
import {
  LoginStartInput,
  LoginStartSuccessDto,
} from '@time-app-test/shared/model/domain/loginStart.ts'

export interface AuthStrategy {
  registerStart(
    data: RegistrationStartInput,
  ): Promise<RegistrationStartSuccessDto>
  registerFinish(
    data: RegistrationFinishInput,
  ): Promise<RegistrationFinishSuccessDto>
  loginStart(data: LoginStartInput): Promise<LoginStartSuccessDto>
}
