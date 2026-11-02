import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postJson } from '@/lib/api'
import { queryKeys } from './query-keys'
import type { CreateRoomRequest, CreateRoomResponse } from './types/room'

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoomRequest) =>
      postJson<CreateRoomResponse>('/rooms', data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms, exact: true })
    },
  })
}
