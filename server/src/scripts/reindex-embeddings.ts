// Recalcula os embeddings dos trechos gravados pela versão antiga do projeto,
// que salvava um vetor zerado no lugar do embedding real.
// Uso: npm run db:reindex
import { eq } from 'drizzle-orm'
import { db, sql } from '../db/connection.js'
import { schema } from '../db/schema/index.js'
import { generateEmbeddings } from '../services/gemini.js'
import { isZeroVector } from '../services/vector.js'

const chunks = await db
  .select({
    id: schema.audioChunks.id,
    transcription: schema.audioChunks.transcription,
    embeddings: schema.audioChunks.embeddings,
  })
  .from(schema.audioChunks)

const pending = chunks.filter((chunk) => isZeroVector(chunk.embeddings))

console.log(`${pending.length} de ${chunks.length} trechos sem embedding.`)

let fixed = 0

for (const chunk of pending) {
  try {
    const embeddings = await generateEmbeddings(
      chunk.transcription,
      'RETRIEVAL_DOCUMENT'
    )

    await db
      .update(schema.audioChunks)
      .set({ embeddings })
      .where(eq(schema.audioChunks.id, chunk.id))

    fixed++
  } catch (error) {
    console.error(`Falha no trecho ${chunk.id}:`, error)
  }
}

await sql.end()

console.log(`${fixed} trechos reindexados.`)
