export type Transcription = {
  id: string
  transcription: string
  createdAt: string
}

export type GetRoomTranscriptionsResponse = Transcription[]

export type UploadAudioResponse =
  | { chunkId: string; transcription: string }
  | { chunkId: null; transcription: '' }

export type CreateSummaryResponse = {
  summary: string
  chunks: number
}
