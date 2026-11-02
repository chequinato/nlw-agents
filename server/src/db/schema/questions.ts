import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.js'

export const questions = pgTable(
  'questions',
  {
    id: uuid().primaryKey().defaultRandom(),
    roomId: uuid()
      .references(() => rooms.id, { onDelete: 'cascade' })
      .notNull(),
    question: text().notNull(),
    answer: text(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index('questions_room_id_idx').on(table.roomId)]
)
