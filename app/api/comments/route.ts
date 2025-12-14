import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get('post_id')
    if (!postId) {
      return NextResponse.json({ error: 'post_id가 필요합니다.' }, { status: 400 })
    }

    const db = getDb()
    const comments = db
      .prepare(
        `SELECT 
          c.*,
          p.username as author_username,
          p.id as author_id
        FROM comments c
        LEFT JOIN profiles p ON c.author_id = p.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC`
      )
      .all(postId)

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json(
      { error: '댓글을 불러올 수 없습니다.' },
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

    const { post_id, content, parent_id } = await request.json()

    if (!post_id || !content) {
      return NextResponse.json(
        { error: '게시글 ID와 내용을 입력하세요.' },
        { status: 400 }
      )
    }

    const db = getDb()
    const id = randomUUID()
    db.prepare(
      `INSERT INTO comments (id, post_id, parent_id, content, author_id) 
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, post_id, parent_id || null, content, user.id)

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

