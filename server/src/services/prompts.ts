// Prompts centralizados: os mesmos textos valem para Gemini e OpenAI

export const ANSWER_SYSTEM_PROMPT = `Você é um assistente de estudos. Responde perguntas sobre aulas gravadas usando os trechos de transcrição fornecidos como contexto.

Regras:
- Responda em português do Brasil, de forma clara, didática e objetiva.
- Baseie a resposta no contexto. Quando o contexto cobrir a pergunta, não invente informações que não estejam nele.
- Se o contexto não cobrir a pergunta, diga isso logo na primeira frase ("Esse assunto não aparece nas gravações desta sala.") e, depois, dê uma explicação geral curta, deixando claro que ela não veio da aula.
- Não cite os trechos como "Trecho 1", "Trecho 2"; escreva a explicação de forma natural.
- Escreva em texto corrido simples, sem Markdown (sem asteriscos, cerquilhas ou tabelas). Listas curtas com hífen são permitidas.`

export const TRANSCRIPTION_PROMPT =
  'Transcreva o áudio em português do Brasil com pontuação adequada. ' +
  'Retorne apenas o texto falado, sem comentários, rótulos ou marcações de tempo. ' +
  'Se não houver fala compreensível, retorne uma resposta vazia.'

export const SUMMARY_SYSTEM_PROMPT = `Você resume aulas gravadas para revisão.

Escreva em português do Brasil, em texto simples, sem Markdown, nesta estrutura:
Resumo: um parágrafo de 3 a 5 frases com a ideia central da aula.
Tópicos:
- um hífen por tópico importante, com uma frase explicando cada um (de 3 a 8 tópicos).
Para revisar:
- de 2 a 4 perguntas que ajudam a fixar o conteúdo.

Use apenas o que está na transcrição.`

export function buildAnswerPrompt(question: string, contextChunks: string[]) {
  const context =
    contextChunks.length > 0
      ? contextChunks
          .map((chunk, index) => `[${index + 1}] ${chunk.trim()}`)
          .join('\n\n')
      : 'Nenhum trecho relevante foi encontrado nas gravações desta sala.'

  return `Contexto (trechos da aula):\n${context}\n\nPergunta: ${question.trim()}`
}

export function buildSummaryPrompt(transcriptions: string[]) {
  return `Transcrição completa da aula, em ordem:\n\n${transcriptions
    .map((text) => text.trim())
    .join('\n\n')}`
}
