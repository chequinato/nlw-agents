import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection.js'      // Node ESM precisa do .js
import { schema } from './schema/index.js'

// Resetando o banco (vai limpar tudo)
await reset(db, {
  rooms: schema.rooms,
  questions: schema.questions,
  // ignora outras tabelas que tenham vector(768)
})

// Seed customizado, sem vector(768)
await seed(db, {
  rooms: schema.rooms,
  questions: schema.questions,
}).refine((f) => ({
  rooms: {
    count: 5,
    columns: {
      name: f.companyName(),
      description: f.loremIpsum(),
      // se tiver vector(768) na rooms, não colocar aqui
    },
  },
  questions: {
    count: 20,
    columns: {
      // coloque aqui só colunas normais
      // se tiver vector(768) em questions, ignora
    },
  },
}))

// Fecha a conexão
await sql.end()

console.log('Database seeded ✅')
