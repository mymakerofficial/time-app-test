import { BaseService } from '@/lib/application/base/baseService.ts'
import { SessionContext } from '@/lib/application/session/sessionStore.ts'
import { NotesApi } from '@/lib/application/notes/api.ts'
import {
  ab2str,
  hexToUint8,
  str2ab,
  uint8ToHex,
} from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import {
  LocalNoteDto,
  SyncStatus,
} from '@time-app-test/shared/model/domain/notes.ts'

class TextCoder {
  constructor(private readonly key: CryptoKey) {}

  async decode<T = string>(
    input: string,
    transform: (input: string) => T = (v) => v as T,
  ) {
    return transform(ab2str(await Crypt.decrypt(hexToUint8(input), this.key)))
  }

  async encode(input: string) {
    return uint8ToHex(await Crypt.encrypt(str2ab(input), this.key))
  }
}

export class NotesService extends BaseService {
  protected readonly notesApi: NotesApi

  constructor(container: { notesApi: NotesApi; session: SessionContext }) {
    super(container)
    this.notesApi = container.notesApi
  }

  async getNotes() {
    const encryptedNotes = await this.notesApi.getNotes()

    const transformer = new TextCoder(this.session.getEncryptionKey())
    const userId = this.session.getUserId()

    return await Promise.all(
      encryptedNotes.map(
        async (it): Promise<LocalNoteDto> => ({
          id: it.id,
          userId,
          createdAt: await transformer.decode(
            it.createdAt,
            (value) => new Date(value),
          ),
          updatedAt: await transformer.decode(
            it.updatedAt,
            (value) => new Date(value),
          ),
          syncStatus: SyncStatus.Synced,
          deleted: false,
          message: await transformer.decode(it.message),
          attachments: await Promise.all(
            it.attachments.map(async (att) => ({
              id: att.id,
              filename: await transformer.decode(att.filename),
              mimeType: att.mimeType,
            })),
          ),
        }),
      ),
    )
  }

  async createNoteOnServer(note: LocalNoteDto) {
    const transformer = new TextCoder(this.session.getEncryptionKey())
    await this.notesApi.createNote({
      id: note.id,
      createdAt: await transformer.encode(note.createdAt.toISOString()),
      updatedAt: await transformer.encode(note.updatedAt.toISOString()),
      message: await transformer.encode(note.message),
      attachments: note.attachments.map((att) => att.id),
    })
  }
}
