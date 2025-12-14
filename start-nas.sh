#!/bin/bash
# NAS에서 서버 시작 스크립트

echo "=== 게시판 사이트 서버 시작 ==="
echo ""

# 프로젝트 폴더로 이동
cd /volume1/site/my-board-site || cd ~/my-board-site

# 환경 변수 확인
if [ -f .env ]; then
    echo "✅ .env 파일 발견"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  .env 파일이 없습니다. 기본값 사용"
    export NAS_PATH=/volume1/site/data
    export JWT_SECRET=change-this-secret-key
    export NODE_ENV=production
fi

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js를 찾을 수 없습니다."
    echo "   Package Center에서 Node.js를 설치하세요."
    exit 1
fi

echo "✅ Node.js 버전: $(node -v)"
echo ""

# 데이터 폴더 생성
mkdir -p "$NAS_PATH"
echo "✅ 데이터 폴더: $NAS_PATH"
echo ""

# PM2 확인
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2가 설치되지 않았습니다. 설치 중..."
    npm install -g pm2
fi

# 서버 시작
echo "🚀 서버 시작 중..."
pm2 start npm --name "my-board-site" -- start

echo ""
echo "✅ 서버가 시작되었습니다!"
echo ""
echo "서버 상태 확인: pm2 status"
echo "로그 확인: pm2 logs my-board-site"
echo "서버 중지: pm2 stop my-board-site"
echo ""
echo "접속 주소: http://192.168.219.55:3000"
echo ""

