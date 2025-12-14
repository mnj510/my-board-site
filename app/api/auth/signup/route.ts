import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '모든 필드를 입력하세요.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // 중복 확인
    const db = getDb()
    const existingUser = db
      .prepare('SELECT * FROM profiles WHERE email = ? OR username = ?')
      .get(email, username) as any

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일 또는 사용자명입니다.' },
        { status: 400 }
      )
    }

    const user = await createUser(username, email, password)
    const token = generateToken(user)

    const response = NextResponse.json({ user, token })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

