import { NextRequest, NextResponse } from 'next/server'
import { verifyAllDataStored, getStoragePath } from '@/lib/verify-storage'
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
    
    const data = verifyAllDataStored()
    const storagePath = getStoragePath()
    
    return NextResponse.json({
      success: true,
      storagePath,
      data,
      message: '모든 데이터가 NAS에 저장되고 있습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: '저장 상태 확인에 실패했습니다.' },
      { status: 500 }
    )
  }
}

