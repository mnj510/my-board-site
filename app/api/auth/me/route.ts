import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserById(decoded.id)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}

