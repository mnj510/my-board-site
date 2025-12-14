import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { can_write } = await request.json()

    const db = getDb()
    
    // 기존 권한 확인
    const existing = db
      .prepare('SELECT * FROM post_permissions WHERE user_id = ?')
      .get(params.id) as any

    if (existing) {
      db.prepare('UPDATE post_permissions SET can_write = ? WHERE user_id = ?').run(
        can_write ? 1 : 0,
        params.id
      )
    } else {
      db.prepare(
        'INSERT INTO post_permissions (id, user_id, can_write) VALUES (?, ?, ?)'
      ).run(randomUUID(), params.id, can_write ? 1 : 0)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '권한 설정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

