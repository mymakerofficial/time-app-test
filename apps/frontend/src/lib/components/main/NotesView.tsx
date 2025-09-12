import { useNotes } from '@/lib/hooks/notes/useNotes.ts'
import { cn } from '@/lib/utils.ts'
import { useEffect, useRef } from 'react'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import {
  LocalNoteDto,
  SyncStatus,
} from '@time-app-test/shared/model/domain/notes.ts'
import { useQuery } from '@tanstack/react-query'
import { Attachments } from '@time-app-test/shared/model/domain/attachments.ts'
import { useSession } from '@/lib/application/session/sessionStore.ts'
import { useContainer } from '@/lib/application/container.ts'

export function NotesView({ className }: { className?: string }) {
  const { data: notes } = useNotes()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [notes])

  return (
    <div className={cn('overflow-y-auto', className)} ref={containerRef}>
      <div className="max-w-2xl mx-auto my-10 p-6 space-y-6">
        {notes.map((note) => (
          <NoteItem note={note} key={note.id} />
        ))}
      </div>
    </div>
  )
}

function NoteItem({ note }: { note: LocalNoteDto }) {
  return (
    <div key={note.id} className="p-4 rounded bg-accent flex flex-col gap-2">
      <div className="flex gap-1 text-xs text-muted-foreground">
        <span>{note.createdAt.toLocaleString()}</span>
        {note.updatedAt.getTime() !== note.createdAt.getTime() && (
          <span>(edited {note.updatedAt.toLocaleString()})</span>
        )}
        <span className="ml-auto">
          {note.syncStatus === SyncStatus.Pending && (
            <LoaderCircleIcon className="animate-spin text-orange-300 size-4" />
          )}
          {note.syncStatus === SyncStatus.Synced && (
            <CheckIcon className="text-green-500 size-4" />
          )}
        </span>
      </div>
      <p>{note.message}</p>
      <div className="flex flex-wrap gap-1">
        {note.attachments.map((attachment) => (
          <AttachmentItem attachment={attachment} key={attachment.id} />
        ))}
      </div>
    </div>
  )
}

function AttachmentItem({
  attachment,
}: {
  attachment: Attachments.MetadataDto
}) {
  const { getUserIdSafe } = useSession()
  const { attachmentsService } = useContainer()
  const { data: url } = useQuery({
    queryKey: ['user', getUserIdSafe(), 'attachments', attachment.id],
    queryFn: async () => {
      const file = await attachmentsService.downloadFile(attachment)
      return URL.createObjectURL(file)
    },
  })

  if (!url) {
    return (
      <span className="text-muted-foreground text-sm">
        Loading {attachment.filename}...
      </span>
    )
  }

  return (
    <div className="max-w-1/3">
      <img src={url} alt={attachment.filename} />
    </div>
  )
}
