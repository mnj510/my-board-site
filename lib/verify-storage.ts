// 데이터 저장 확인 유틸리티
import { getDb } from './db'

export function verifyAllDataStored() {
  const db = getDb()
  
  const tables = [
    'profiles',
    'categories', 
    'posts',
    'comments',
    'post_permissions'
  ]
  
  const results: Record<string, number> = {}
  
  tables.forEach(table => {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }
      results[table] = count.count
    } catch (error) {
      results[table] = -1
    }
  })
  
  return results
}

export function getStoragePath() {
  return process.env.NAS_PATH || 'data'
}

