import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const db = getDb()
    const users = db
      .prepare(
        `SELECT 
          p.*,
          pp.can_write
        FROM profiles p
        LEFT JOIN post_permissions pp ON p.id = pp.user_id
        ORDER BY p.created_at DESC`
      )
      .all()

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: '사용자 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

