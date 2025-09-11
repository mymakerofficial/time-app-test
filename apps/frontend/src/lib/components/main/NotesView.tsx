import { useNotes } from '@/lib/hooks/notes/useNotes.ts'
import { cn } from '@/lib/utils.ts'
import { useEffect, useRef } from 'react'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import { SyncStatus } from '@time-app-test/shared/model/domain/notes.ts'

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
          <div
            key={note.id}
            className="p-4 rounded bg-accent flex flex-col gap-2"
          >
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
            <div className="flex gap-1">
              {note.attachments.map((attachment) => (
                <div key={attachment.id}>
                  <p className="text-blue-500 text-sm">
                    Attachment ({attachment.filename} - {attachment.mimeType})
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
