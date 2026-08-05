import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull().default('Sin título'),
  icon: text('icon'),
  coverImage: text('cover_image'),
  content: text('content').notNull().default(''),
  parentId: text('parent_id'),
  tags: text('tags').notNull().default('[]'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  color: text('color').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const workspace = sqliteTable('workspace', {
  id: text('id').primaryKey().default('default'),
  name: text('name').notNull().default('Mi Espacio'),
});
