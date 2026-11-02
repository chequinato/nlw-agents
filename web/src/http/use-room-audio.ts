import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from './query-keys'
import type {
  CreateSummaryResponse,
  GetRoomTranscriptionsResponse,
  UploadAudioResponse,
} from './types/audio'

export function useRoomTranscriptions(roomId: string) {
  return useQuery({
    queryKey: queryKeys.transcriptions(roomId),
    queryFn: () =>
      api<GetRoomTranscriptionsResponse>(`/rooms/${roomId}/transcriptions`),
  })
}

export function useUploadAudio(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (audio: Blob) => {
      const formData = new FormData()
      const extension = audio.type.includes('ogg') ? 'ogg' : 'webm'
      formData.append('file', audio, `audio.${extension}`)

      return api<UploadAudioResponse>(`/rooms/${roomId}/audio`, {
        method: 'POST',
        body: formData,
      })
    },

    onSuccess: (data) => {
      if (!data.chunkId) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.transcriptions(roomId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.room(roomId),
        exact: true,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms, exact: true })
    },
  })
}

export function useCreateSummary(roomId: string) {
  return useMutation({
    mutationFn: () =>
      api<CreateSummaryResponse>(`/rooms/${roomId}/summary`, {
        method: 'POST',
      }),
  })
}
