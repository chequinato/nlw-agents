import OpenAI from 'openai'
import { env } from '../env.js'
import { ANSWER_SYSTEM_PROMPT, buildAnswerPrompt } from './prompts.js'

// Só cria o cliente quando a chave existe: a OpenAI é um fallback opcional
const client = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null

export function isOpenAIConfigured() {
  return client !== null
}

export async function generateAnswer(
  question: string,
  contextChunks: string[]
) {
  if (!client) {
    throw new Error('OPENAI_API_KEY não configurada.')
  }

  const completion = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: ANSWER_SYSTEM_PROMPT },
      { role: 'user', content: buildAnswerPrompt(question, contextChunks) },
    ],
    temperature: 0.2,
  })

  const answer = completion.choices[0]?.message.content?.trim()

  if (!answer) {
    throw new Error('A OpenAI retornou uma resposta vazia.')
  }

  return answer
}
