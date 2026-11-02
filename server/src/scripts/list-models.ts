// Lista os modelos do Gemini disponíveis para a sua chave.
// Uso: npm run list-models
import 'dotenv/config'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('GEMINI_API_KEY não definida.')
  process.exit(1)
}

const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',
  { headers: { 'x-goog-api-key': apiKey } }
)

if (!response.ok) {
  console.error(`Erro HTTP ${response.status} ${response.statusText}`)
  process.exit(1)
}

const data = (await response.json()) as {
  models: { name: string; supportedGenerationMethods: string[] }[]
}

for (const model of data.models) {
  console.log(
    `${model.name.replace('models/', '').padEnd(45)} ${model.supportedGenerationMethods.join(', ')}`
  )
}
