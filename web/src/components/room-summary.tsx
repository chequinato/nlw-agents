import { Loader2, Sparkles } from 'lucide-react'
import { useCreateSummary } from '@/http/use-room-audio'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

interface RoomSummaryProps {
  roomId: string
  hasAudio: boolean
}

export function RoomSummary({ roomId, hasAudio }: RoomSummaryProps) {
  const {
    mutate: createSummary,
    data,
    error,
    isPending,
  } = useCreateSummary(roomId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Resumo da aula</CardTitle>
          <CardDescription>
            {hasAudio
              ? 'Ideia central, tópicos e perguntas de revisão a partir de tudo que foi gravado.'
              : 'Grave um áudio nesta sala para poder gerar o resumo.'}
          </CardDescription>
        </div>
        <Button
          disabled={!hasAudio || isPending}
          onClick={() => createSummary()}
          variant="secondary"
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {data ? 'Gerar de novo' : 'Gerar resumo'}
        </Button>
      </CardHeader>

      {(data || error) && (
        <CardContent>
          {error && <p className="text-destructive text-sm">{error.message}</p>}

          {data && (
            <div className="space-y-3">
              <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
                {data.summary}
              </p>
              <p className="text-muted-foreground/70 text-xs">
                Baseado em {data.chunks}{' '}
                {data.chunks === 1 ? 'trecho gravado' : 'trechos gravados'}.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
