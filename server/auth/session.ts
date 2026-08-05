import { eq } from 'drizzle-orm';
import { db } from '../db';
import { sessions, users } from '../db/schema';
import crypto from 'crypto';

export interface UserDTO {
  id: string;
  username: string;
  color: string;
  createdAt: Date;
}

/**
 * Creates a new session for a user valid for 30 days.
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });

  return token;
}

/**
 * Validates a session token and returns the corresponding user without passwordHash.
 */
export async function validateSession(token: string): Promise<UserDTO | null> {
  if (!token) return null;

  const sessionResult = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token));

  if (sessionResult.length === 0) {
    return null;
  }

  const session = sessionResult[0];

  if (new Date(session.expiresAt) <= new Date()) {
    // Delete expired session
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }

  const userResult = await db
    .select({
      id: users.id,
      username: users.username,
      color: users.color,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId));

  if (userResult.length === 0) {
    return null;
  }

  return userResult[0];
}

/**
 * Deletes a session token from the database.
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.id, token));
}
