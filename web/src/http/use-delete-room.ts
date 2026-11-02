import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from './query-keys'
import type { GetRoomsResponse } from './types/room'

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) =>
      api<void>(`/rooms/${roomId}`, { method: 'DELETE' }),

    // Some da lista na hora; se o servidor recusar, a lista volta
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.rooms })

      const previous = queryClient.getQueryData<GetRoomsResponse>(
        queryKeys.rooms
      )

      queryClient.setQueryData<GetRoomsResponse>(queryKeys.rooms, (rooms) =>
        rooms?.filter((room) => room.id !== roomId)
      )

      return { previous }
    },

    onError: (_error, _roomId, context) => {
      queryClient.setQueryData(queryKeys.rooms, context?.previous)
    },

    onSettled: (_data, _error, roomId) => {
      queryClient.removeQueries({ queryKey: queryKeys.room(roomId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms, exact: true })
    },
  })
}
