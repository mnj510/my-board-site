import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

// NAS 경로 설정 (환경 변수에서 가져오거나 기본값 사용)
const NAS_PATH = process.env.NAS_PATH || path.join(process.cwd(), 'data')
const DB_PATH = path.join(NAS_PATH, 'database.db')

// NAS 디렉토리가 없으면 생성
if (!fs.existsSync(NAS_PATH)) {
  fs.mkdirSync(NAS_PATH, { recursive: true })
}

// 데이터베이스 연결
let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeDatabase(db)
  }
  return db
}

function initializeDatabase(db: Database.Database) {
  // Profiles 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Categories 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Posts 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category_id TEXT,
      thumbnail_url TEXT,
      author_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (author_id) REFERENCES profiles(id)
    )
  `)

  // Post Permissions 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_permissions (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      can_write INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id)
    )
  `)

  // Comments 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      parent_id TEXT,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES profiles(id)
    )
  `)

  // 기본 카테고리 추가
  const categoryCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (categoryCheck.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)')
    insertCategory.run(randomUUID(), '일반', 'general')
    insertCategory.run(randomUUID(), '공지사항', 'notice')
    insertCategory.run(randomUUID(), '질문', 'question')
  }
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

