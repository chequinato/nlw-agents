import { ArrowLeft, Radio } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QuestionForm } from '@/components/question-form'
import { QuestionList } from '@/components/question-list'
import { RoomSummary } from '@/components/room-summary'
import { TranscriptionList } from '@/components/transcription-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRoom } from '@/http/use-rooms'

type RoomParams = {
  roomId: string
}

export function Room() {
  const params = useParams<RoomParams>()

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  return <RoomContent roomId={params.roomId} />
}

function RoomContent({ roomId }: { roomId: string }) {
  const { data: room, error } = useRoom(roomId)

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{error.message}</p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft />
            Voltar ao início
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft />
                Voltar ao início
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={`/room/${roomId}/audio`}>
                <Radio />
                Gravar áudio
              </Link>
            </Button>
          </div>

          <h1 className="mb-2 font-bold text-3xl text-foreground">
            {room?.name ?? 'Carregando sala...'}
          </h1>

          <p className="text-muted-foreground">
            {room?.description || 'Faça perguntas e receba respostas com IA'}
          </p>

          {room && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {room.audioChunksCount}{' '}
                {room.audioChunksCount === 1 ? 'trecho' : 'trechos'} de áudio
              </Badge>
              <Badge variant="secondary">
                {room.questionsCount}{' '}
                {room.questionsCount === 1 ? 'pergunta' : 'perguntas'}
              </Badge>
            </div>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <RoomSummary
            hasAudio={(room?.audioChunksCount ?? 0) > 0}
            roomId={roomId}
          />
          <TranscriptionList roomId={roomId} />
        </div>

        <div className="mb-8">
          <QuestionForm roomId={roomId} />
        </div>

        <QuestionList roomId={roomId} />
      </div>
    </div>
  )
}
