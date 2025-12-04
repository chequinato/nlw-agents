import { ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRooms } from '@/http/use-rooms'
import { useDeleteRoom } from '@/http/use-delete-room'
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
  const { data, isLoading } = useRooms()
  const { mutate: deleteRoom } = useDeleteRoom()

  // garante que data é array
  const rooms = Array.isArray(data) ? data : []

  const handleDelete = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault()
    if (confirm('Tem certeza que deseja deletar esta sala?')) {
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

        {!isLoading && rooms.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma sala encontrada.
          </p>
        )}

        {rooms.map((room) => (
          <div
            className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50"
            key={room.id}
          >
            <Link
              className="flex flex-1 flex-col gap-1"
              to={`/room/${room.id}`}
            >
              <h3 className="font-medium">{room.name}</h3>

              <div className="flex items-center gap-2">
                <Badge className="text-xs" variant="secondary">
                  {dayjs(room.createdAt).toNow()}
                </Badge>
                <Badge className="text-xs" variant="secondary">
                  {room.questionsCount} pergunta(s)
                </Badge>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to={`/room/${room.id}`}
                className="flex items-center gap-1 text-sm hover:text-blue-400"
              >
                Entrar
                <ArrowRight className="size-3" />
              </Link>
              <button
                onClick={(e) => handleDelete(e, room.id)}
                className="p-2 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600"
                title="Deletar sala"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
