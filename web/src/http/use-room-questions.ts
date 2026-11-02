import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from './query-keys'
import type { GetRoomQuestionsResponse } from './types/question'

export function useRoomQuestions(roomId: string) {
  return useQuery({
    queryKey: queryKeys.questions(roomId),
    queryFn: () => api<GetRoomQuestionsResponse>(`/rooms/${roomId}/questions`),
  })
}
