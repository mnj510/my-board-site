import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const categoryId = request.nextUrl.searchParams.get('category_id')

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        pr.username as author_username
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN profiles pr ON p.author_id = pr.id
    `

    if (categoryId && categoryId !== 'all') {
      query += ' WHERE p.category_id = ?'
      const posts = db.prepare(query).all(categoryId)
      return NextResponse.json({ posts })
    } else {
      query += ' ORDER BY p.created_at DESC'
      const posts = db.prepare(query).all()
      return NextResponse.json({ posts })
    }
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
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
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 권한 확인
    const db = getDb()
    if (!user.is_admin) {
      const permission = db
        .prepare('SELECT can_write FROM post_permissions WHERE user_id = ?')
        .get(user.id) as any

      if (!permission || !permission.can_write) {
        return NextResponse.json(
          { error: '게시글 작성 권한이 없습니다.' },
          { status: 403 }
        )
      }
    }

    const { title, content, category_id, thumbnail_url } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력하세요.' },
        { status: 400 }
      )
    }

    const id = randomUUID()
    db.prepare(
      `INSERT INTO posts (id, title, content, category_id, thumbnail_url, author_id) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, title, content, category_id || null, thumbnail_url || null, user.id)

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

