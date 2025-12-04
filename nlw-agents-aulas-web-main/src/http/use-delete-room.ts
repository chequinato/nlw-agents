import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao deletar sala')
      }

      return response.json()
    },

    onSuccess: () => {
      // Invalida o cache de salas para recarregar
      queryClient.invalidateQueries(['get-rooms'])
    },
  })
}
