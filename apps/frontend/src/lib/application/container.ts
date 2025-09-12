import { Container } from '@time-app-test/shared/helper/container.ts'
import { getSessionContext } from '@/lib/application/session/sessionStore.ts'
import { AuthApi } from '@/lib/application/auth/api.ts'
import { AuthService } from '@/lib/application/auth/authService.ts'
import { NotesApi } from '@/lib/application/notes/api.ts'
import { NotesService } from '@/lib/application/notes/notesService.ts'
import { AttachmentsApi } from '@/lib/application/attachments/api.ts'
import { AttachmentsService } from '@/lib/application/attachments/attachmentsService.ts'

export const container = new Container()
  .add('session', getSessionContext)
  .add('authApi', (container) => new AuthApi(container))
  .add('authService', (container) => new AuthService(container))
  .add('notesApi', (container) => new NotesApi(container))
  .add('notesService', (container) => new NotesService(container))
  .add('attachmentsApi', (container) => new AttachmentsApi(container))
  .add('attachmentsService', (container) => new AttachmentsService(container))
  .build()

export function useContainer() {
  return container
}
