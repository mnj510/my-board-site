import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from './db'
import { randomUUID } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User
    return decoded
  } catch {
    return null
  }
}

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const db = getDb()
  const id = randomUUID()
  const passwordHash = await hashPassword(password)

  db.prepare(
    'INSERT INTO profiles (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, username, email, passwordHash)

  // 기본 권한 부여
  db.prepare(
    'INSERT INTO post_permissions (id, user_id, can_write) VALUES (?, ?, 1)'
  ).run(randomUUID(), id)

  return {
    id,
    username,
    email,
    is_admin: false,
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const db = getDb()
  const user = db
    .prepare('SELECT * FROM profiles WHERE email = ?')
    .get(email) as any

  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.is_admin === 1,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb()
  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any

  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.is_admin === 1,
  }
}

