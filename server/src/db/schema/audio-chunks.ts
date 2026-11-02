import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core'
import { rooms } from './rooms.js'

export const audioChunks = pgTable(
  'audio_chunks',
  {
    id: uuid().primaryKey().defaultRandom(),
    roomId: uuid()
      .references(() => rooms.id, { onDelete: 'cascade' })
      .notNull(),
    transcription: text().notNull(),
    embeddings: vector({ dimensions: 768 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('audio_chunks_room_id_idx').on(table.roomId),
    // Índice HNSW para a busca por similaridade de cosseno (operador <=>)
    index('audio_chunks_embeddings_idx').using(
      'hnsw',
      table.embeddings.op('vector_cosine_ops')
    ),
  ]
)
