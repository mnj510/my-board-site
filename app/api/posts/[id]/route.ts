import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const post = db
      .prepare(
        `SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          pr.username as author_username,
          pr.id as author_id
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN profiles pr ON p.author_id = pr.id
        WHERE p.id = ?`
      )
      .get(params.id) as any

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

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
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const db = getDb()
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(params.id) as any

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 권한 확인
    if (!user.is_admin && post.author_id !== user.id) {
      const permission = db
        .prepare('SELECT can_write FROM post_permissions WHERE user_id = ?')
        .get(user.id) as any

      if (!permission || !permission.can_write) {
        return NextResponse.json(
          { error: '수정 권한이 없습니다.' },
          { status: 403 }
        )
      }
    }

    const { title, content, category_id, thumbnail_url } = await request.json()

    db.prepare(
      `UPDATE posts 
       SET title = ?, content = ?, category_id = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(title, content, category_id || null, thumbnail_url || null, params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

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
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const db = getDb()
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(params.id) as any

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 권한 확인 (작성자 또는 관리자)
    if (!user.is_admin && post.author_id !== user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

