import { SessionContext } from '@/lib/application/session/sessionStore.ts'

export abstract class BaseService {
  protected readonly session: SessionContext

  constructor({ session }: { session: SessionContext }) {
    this.session = session
  }
}
