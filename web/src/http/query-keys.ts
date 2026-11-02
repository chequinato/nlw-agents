// Chaves do React Query num lugar só, para as invalidações não divergirem
export const queryKeys = {
  rooms: ['rooms'] as const,
  room: (roomId: string) => ['rooms', roomId] as const,
  questions: (roomId: string) => ['rooms', roomId, 'questions'] as const,
  transcriptions: (roomId: string) =>
    ['rooms', roomId, 'transcriptions'] as const,
}
