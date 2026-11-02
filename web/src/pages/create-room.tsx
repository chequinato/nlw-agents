import { CreateRoomForm } from '@/components/create-room-form'
import { RoomList } from '@/components/room-list'

export function CreateRoom() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 space-y-2">
          <h1 className="font-bold text-3xl text-foreground">NLW Agents</h1>
          <p className="max-w-2xl text-muted-foreground">
            Grave a aula, deixe a IA transcrever e depois pergunte o que não
            ficou claro. As respostas vêm do que foi falado na gravação.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
          <CreateRoomForm />
          <RoomList />
        </div>
      </div>
    </div>
  )
}
