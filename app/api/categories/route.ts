import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const db = getDb()
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all()
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json(
      { error: '카테고리를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { name, slug } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: '카테고리 이름과 슬러그를 입력하세요.' },
        { status: 400 }
      )
    }

    const db = getDb()
    const id = randomUUID()
    db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug)

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: '이미 존재하는 슬러그입니다.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '카테고리 추가에 실패했습니다.' },
      { status: 500 }
    )
  }
}

