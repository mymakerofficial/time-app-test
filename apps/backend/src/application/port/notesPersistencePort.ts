import { EncryptedNote } from '@/domain/model/notes'

export interface NotesPersistencePort {
  getAll(userId: string): Promise<EncryptedNote[]>
}
