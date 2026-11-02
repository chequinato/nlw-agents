import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from './query-keys'
import type { GetRoomsResponse, Room } from './types/room'

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms,
    queryFn: () => api<GetRoomsResponse>('/rooms'),
  })
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.room(roomId),
    queryFn: () => api<Room>(`/rooms/${roomId}`),
    retry: (failureCount, error) =>
      // 404 não melhora tentando de novo
      !('status' in error && error.status === 404) && failureCount < 2,
  })
}
