import { SessionContext } from '@/lib/application/session/sessionStore.ts'

export abstract class BaseApi {
  protected readonly session: SessionContext
  protected readonly container: Record<string, unknown>

  constructor(container: { session: SessionContext }) {
    this.session = container.session
    this.container = container
  }
}
