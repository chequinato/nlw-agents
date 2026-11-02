export type Question = {
  id: string
  question: string
  answer: string | null
  createdAt: string
  // Só existe no cache local enquanto a IA responde (update otimista)
  isGeneratingAnswer?: boolean
}

export type GetRoomQuestionsResponse = Question[]

export type CreateQuestionRequest = {
  question: string
}

export type CreateQuestionResponse = {
  questionId: string
  answer: string
  provider: 'gemini' | 'openai'
  contextChunks: number
}
