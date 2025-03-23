import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  index,
  jsonb
} from 'drizzle-orm/pg-core';

export const contractStatusEnum = pgEnum('contract_status', ['Draft', 'Finalized']);

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull(),
  parties: text('parties').array().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  partiesIdx: index('parties_idx').on(table.parties),
  statusIdx: index('status_idx').on(table.status),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  updatedAtIdx: index('updated_at_idx').on(table.updatedAt)
}));
