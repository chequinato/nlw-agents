import { useQuery } from '@tanstack/react-query'
import type { GetRoomQuestionsResponse } from './types/get-room-questions-response'

export function useRoomQuestions(roomId: string) {
  return useQuery<GetRoomQuestionsResponse>({
    queryKey: ['get-questions', roomId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/questions`
      )
      const data: GetRoomQuestionsResponse = await response.json()
      return data ?? []
    },
    staleTime: 0,           // força atualizar sempre que abrir
    refetchOnWindowFocus: true, // atualiza ao voltar pra aba
  })
}
