# 🚀 GitHub 배포 빠른 가이드

## 1단계: GitHub 저장소 생성

1. https://github.com 접속
2. 로그인 후 우측 상단 `+` 클릭 > `New repository`
3. 저장소 이름 입력 (예: `my-board-site`)
4. Public 또는 Private 선택
5. `Create repository` 클릭

## 2단계: 로컬에서 Git 설정 및 푸시

터미널에서 다음 명령어 실행:

```bash
cd /Users/nj/Downloads/site2

# Git 초기화 (이미 완료됨)
# git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 게시판 사이트"

# GitHub 저장소 연결 (위에서 생성한 저장소 URL 사용)
git remote add origin https://github.com/사용자명/저장소명.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 3단계: 호스팅 서비스 선택 및 배포

### 옵션 A: Railway (추천)

1. https://railway.app 접속
2. GitHub로 로그인
3. `New Project` > `Deploy from GitHub repo`
4. 저장소 선택
5. 환경 변수 설정:
   - `JWT_SECRET`: 임의의 긴 문자열
   - `NODE_ENV`: `production`
6. 자동 배포 완료!

### 옵션 B: Render

1. https://render.com 접속
2. GitHub로 로그인
3. `New` > `Web Service`
4. 저장소 선택
5. 설정:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. 환경 변수 설정
7. `Create Web Service`

### 옵션 C: Fly.io

1. https://fly.io 접속
2. 계정 생성
3. `flyctl` 설치
4. `fly launch` 실행
5. 배포

## 4단계: 배포 확인

배포가 완료되면:
- 제공된 URL로 접속
- 사이트가 정상 작동하는지 확인
- 회원가입, 게시글 작성 테스트

## ⚠️ 주의사항

### 데이터베이스 문제

호스팅 서비스에서는 SQLite 파일 시스템 접근이 제한될 수 있습니다.

**해결 방법**:
1. PostgreSQL 사용 (Railway, Render 제공)
2. 또는 SQLite를 사용하되 임시 디렉토리 사용

### 환경 변수

`.env.local` 파일은 커밋하지 마세요!
- GitHub Secrets 사용
- 호스팅 서비스의 환경 변수 사용

## 🔗 배포 후

배포가 완료되면:
- ✅ 어디서든 접속 가능
- ✅ 24/7 작동
- ✅ 자동 업데이트 (GitHub 푸시 시)

## 📞 문제 해결

배포 중 문제가 발생하면:
1. 호스팅 서비스의 로그 확인
2. 환경 변수 확인
3. 빌드 로그 확인

