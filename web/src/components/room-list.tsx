import { ArrowRight, Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteRoom } from '@/http/use-delete-room'
import { useRooms } from '@/http/use-rooms'
import { dayjs } from '@/lib/dayjs'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

export function RoomList() {
  const { data: rooms, isLoading, error, refetch } = useRooms()
  const { mutate: deleteRoom, error: deleteError } = useDeleteRoom()

  function handleDelete(event: MouseEvent, roomId: string, name: string) {
    event.preventDefault()

    if (
      confirm(
        `Apagar a sala "${name}"? As perguntas e transcrições dela também serão apagadas.`
      )
    ) {
      deleteRoom(roomId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salas recentes</CardTitle>
        <CardDescription>
          Acesso rápido para as salas criadas recentemente
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <p className="text-muted-foreground text-sm">Carregando salas...</p>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 p-3">
            <p className="text-destructive text-sm">{error.message}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline">
              Tentar de novo
            </Button>
          </div>
        )}

        {deleteError && (
          <p className="text-destructive text-sm" role="alert">
            {deleteError.message}
          </p>
        )}

        {rooms?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma sala ainda. Crie a primeira ao lado.
          </p>
        )}

        {rooms?.map((room) => (
          <div
            className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
            key={room.id}
          >
            <Link
              className="flex min-w-0 flex-1 flex-col gap-1"
              to={`/room/${room.id}`}
            >
              <h3 className="truncate font-medium">{room.name}</h3>

              {room.description && (
                <p className="truncate text-muted-foreground text-xs">
                  {room.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="text-xs" variant="secondary">
                  {dayjs(room.createdAt).fromNow()}
                </Badge>
                <Badge className="text-xs" variant="secondary">
                  {room.questionsCount}{' '}
                  {room.questionsCount === 1 ? 'pergunta' : 'perguntas'}
                </Badge>
                <Badge className="text-xs" variant="secondary">
                  {room.audioChunksCount}{' '}
                  {room.audioChunksCount === 1 ? 'trecho' : 'trechos'} de áudio
                </Badge>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                className="flex items-center gap-1 px-2 text-sm hover:text-primary"
                to={`/room/${room.id}`}
              >
                Entrar
                <ArrowRight className="size-3" />
              </Link>
              <Button
                aria-label={`Apagar a sala ${room.name}`}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={(event) => handleDelete(event, room.id, room.name)}
                size="icon"
                title="Apagar sala"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
