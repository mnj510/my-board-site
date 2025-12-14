#!/bin/bash
# NAS에서 서버 실행 스크립트

echo "=== NAS에서 서버 실행 ==="
echo ""

# NAS 경로 확인
if [ -z "$NAS_PATH" ]; then
    echo "❌ NAS_PATH 환경 변수가 설정되지 않았습니다."
    echo "   .env.local 파일에 NAS_PATH를 설정하세요."
    exit 1
fi

echo "✅ NAS 경로: $NAS_PATH"
echo ""

# 데이터베이스 확인
if [ ! -f "$NAS_PATH/database.db" ]; then
    echo "⚠️  데이터베이스 파일이 없습니다. 생성합니다..."
    mkdir -p "$NAS_PATH"
fi

echo "✅ 데이터베이스: $NAS_PATH/database.db"
echo ""

# 서버 실행
echo "🚀 서버를 시작합니다..."
echo "   접속 주소: http://localhost:3000"
echo "   또는 네트워크 주소: http://[서버IP]:3000"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

npm run dev

