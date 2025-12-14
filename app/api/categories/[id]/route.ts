import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
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

    const db = getDb()
    db.prepare('DELETE FROM categories WHERE id = ?').run(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '카테고리 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

