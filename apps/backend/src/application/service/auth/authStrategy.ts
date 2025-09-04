import { LoginStart } from '@time-app-test/shared/model/domain/auth/loginStart.ts'
import { RegistrationStart } from '@time-app-test/shared/model/domain/auth/registrationStart.ts'
import { RegistrationFinish } from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'

export interface AuthStrategy {
  registerStart(
    data: RegistrationStart.StrategyInputDto,
  ): Promise<RegistrationStart.StrategyResultDto>
  registerFinish(
    data: RegistrationFinish.StrategyInputDto,
  ): Promise<RegistrationFinish.StrategyResultDto>
  loginStart(
    data: LoginStart.StrategyInputDto,
  ): Promise<LoginStart.StrategyResultDto>
}
