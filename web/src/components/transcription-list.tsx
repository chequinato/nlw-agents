import { ChevronDown } from 'lucide-react'
import { useRoomTranscriptions } from '@/http/use-room-audio'
import { dayjs } from '@/lib/dayjs'

interface TranscriptionListProps {
  roomId: string
  defaultOpen?: boolean
}

export function TranscriptionList({
  roomId,
  defaultOpen = false,
}: TranscriptionListProps) {
  const { data, isLoading, error } = useRoomTranscriptions(roomId)

  if (isLoading || !data?.length) {
    return error ? (
      <p className="text-destructive text-sm">{error.message}</p>
    ) : null
  }

  return (
    <details className="group rounded-xl border" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium [&::-webkit-details-marker]:hidden">
        Transcrição da aula ({data.length}{' '}
        {data.length === 1 ? 'trecho' : 'trechos'})
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <ol className="max-h-96 space-y-3 overflow-y-auto border-t p-4">
        {data.map((chunk) => (
          <li className="flex gap-3 text-sm" key={chunk.id}>
            <time
              className="w-12 shrink-0 pt-0.5 font-mono text-muted-foreground text-xs tabular-nums"
              dateTime={chunk.createdAt}
            >
              {dayjs(chunk.createdAt).format('HH:mm')}
            </time>
            <p className="text-muted-foreground leading-relaxed">
              {chunk.transcription}
            </p>
          </li>
        ))}
      </ol>
    </details>
  )
}
