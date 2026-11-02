import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection.js'
import { schema } from './schema/index.js'

// Limpa as três tabelas (inclusive audio_chunks, para não sobrar trecho órfão)
await reset(db, schema)

// audio_chunks fica de fora do seed: embeddings falsos atrapalhariam a busca
// semântica. Para ter trechos de verdade, grave áudio pela interface.
await seed(db, {
  rooms: schema.rooms,
  questions: schema.questions,
}).refine((f) => ({
  rooms: {
    count: 5,
    columns: {
      name: f.companyName(),
      description: f.loremIpsum(),
    },
  },
  questions: {
    count: 20,
  },
}))

await sql.end()

console.log('Banco populado com 5 salas e 20 perguntas.')
