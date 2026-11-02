import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postJson } from '@/lib/api'
import { queryKeys } from './query-keys'
import type {
  CreateQuestionRequest,
  CreateQuestionResponse,
  GetRoomQuestionsResponse,
} from './types/question'

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()
  const key = queryKeys.questions(roomId)

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) =>
      postJson<CreateQuestionResponse>(`/rooms/${roomId}/questions`, data),

    // A pergunta aparece no topo da lista com "gerando resposta..." enquanto
    // a IA trabalha, em vez de a tela ficar parada esperando
    onMutate: async ({ question }) => {
      await queryClient.cancelQueries({ queryKey: key })

      const previous = queryClient.getQueryData<GetRoomQuestionsResponse>(key)
      const tempId = `temp-${crypto.randomUUID()}`

      queryClient.setQueryData<GetRoomQuestionsResponse>(key, [
        {
          id: tempId,
          question,
          answer: null,
          createdAt: new Date().toISOString(),
          isGeneratingAnswer: true,
        },
        ...(previous ?? []),
      ])

      return { previous, tempId }
    },

    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<GetRoomQuestionsResponse>(key, (questions) =>
        questions?.map((item) =>
          item.id === context?.tempId
            ? {
                ...item,
                id: data.questionId,
                answer: data.answer,
                isGeneratingAnswer: false,
              }
            : item
        )
      )
    },

    onError: (_error, _variables, context) => {
      queryClient.setQueryData(key, context?.previous)
    },

    onSettled: () => {
      // exact: sem ele a invalidação desceria para ['rooms', id, 'questions']
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms, exact: true })
      queryClient.invalidateQueries({
        queryKey: queryKeys.room(roomId),
        exact: true,
      })
    },
  })
}
