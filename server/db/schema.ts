import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  workspaceId: text('workspace_id').notNull().default('default'),
  title: text('title').notNull().default('Sin título'),
  icon: text('icon'),
  coverImage: text('cover_image'),
  content: text('content').notNull().default(''),
  parentId: text('parent_id'),
  tags: text('tags').notNull().default('[]'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false),
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
  ownerId: text('owner_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const pageVersions = sqliteTable('page_versions', {
  id: text('id').primaryKey(),
  pageId: text('page_id')
    .notNull()
    .references(() => pages.id),
  userId: text('user_id'),
  title: text('title').notNull().default('Sin título'),
  content: text('content').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blockComments = sqliteTable('block_comments', {
  id: text('id').primaryKey(),
  pageId: text('page_id')
    .notNull()
    .references(() => pages.id),
  blockId: text('block_id'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
