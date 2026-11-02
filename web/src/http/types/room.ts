export type Room = {
  id: string
  name: string
  description: string | null
  createdAt: string
  questionsCount: number
  audioChunksCount: number
}

export type GetRoomsResponse = Room[]

export type CreateRoomRequest = {
  name: string
  description?: string
}

export type CreateRoomResponse = {
  roomId: string
}
