import { EncryptedNote } from '@time-app-test/shared/domain/model/notes'

export interface NotesPersistencePort {
  getAll(userId: string): Promise<EncryptedNote[]>
}
