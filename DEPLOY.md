# 🚀 GitHub 배포 가이드

## ⚠️ 중요 사항

현재 프로젝트는 **서버 사이드 애플리케이션**입니다:
- Next.js API Routes 사용
- SQLite 데이터베이스 사용
- 서버가 실행되어야 작동

**GitHub Pages는 정적 사이트만 호스팅 가능**하므로, 현재 구조로는 직접 배포가 어렵습니다.

## 📋 배포 옵션

### 옵션 1: GitHub에 코드 저장 (권장)

코드를 GitHub에 저장하고, 다른 호스팅 서비스 사용:

1. **GitHub에 코드 푸시**
2. **호스팅 서비스 선택**:
   - Railway (무료 플랜 있음)
   - Render (무료 플랜 있음)
   - Fly.io (무료 플랜 있음)
   - DigitalOcean App Platform

### 옵션 2: 자체 서버 사용

현재처럼 자체 서버에서 실행:
- 장점: 완전한 제어
- 단점: 서버를 항상 켜두어야 함

## 🔧 GitHub에 코드 푸시하기

### 1단계: GitHub 저장소 생성

1. GitHub.com에 로그인
2. 새 저장소 생성 (예: `my-board-site`)
3. 저장소 URL 복사

### 2단계: 로컬에서 Git 설정

```bash
cd /Users/nj/Downloads/site2

# Git 초기화 (이미 완료됨)
git init

# 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 게시판 사이트"

# GitHub 저장소 연결
git remote add origin https://github.com/사용자명/저장소명.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 3단계: 환경 변수 설정

GitHub 저장소에서:
1. Settings > Secrets and variables > Actions
2. 다음 환경 변수 추가:
   - `JWT_SECRET`: JWT 시크릿 키
   - `NAS_PATH`: (호스팅 서비스에서 설정)

## 🌐 공개 접근 가능하게 하기

### Railway 사용 (추천)

1. **Railway 계정 생성**: https://railway.app
2. **GitHub 저장소 연결**
3. **환경 변수 설정**:
   - `JWT_SECRET`: 시크릿 키
   - `NAS_PATH`: (선택사항)
4. **자동 배포**: GitHub에 푸시하면 자동 배포

### Render 사용

1. **Render 계정 생성**: https://render.com
2. **Web Service 생성**
3. **GitHub 저장소 연결**
4. **환경 변수 설정**
5. **배포**

### Fly.io 사용

1. **Fly.io 계정 생성**: https://fly.io
2. **fly.toml 설정 파일 생성**
3. **배포**

## 📝 배포 전 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 데이터베이스 파일이 커밋되지 않는지 확인
- [ ] 민감한 정보가 코드에 없는지 확인
- [ ] GitHub 저장소 생성
- [ ] 코드 푸시
- [ ] 호스팅 서비스 선택 및 설정

## 🔐 보안 주의사항

### 절대 커밋하지 말아야 할 것:
- `.env.local` 파일
- `data/database.db` 파일
- 비밀번호, API 키 등

### 안전하게 관리:
- GitHub Secrets 사용
- 호스팅 서비스의 환경 변수 사용

## 🚀 빠른 배포 (Railway 예시)

```bash
# 1. GitHub에 푸시
git add .
git commit -m "Deploy ready"
git push origin main

# 2. Railway에서
# - New Project > Deploy from GitHub
# - 저장소 선택
# - 환경 변수 설정
# - Deploy!
```

## 📊 배포 후 확인

배포가 완료되면:
1. 제공된 URL로 접속 테스트
2. 회원가입 테스트
3. 게시글 작성 테스트
4. 데이터 저장 확인

## 💡 팁

### 무료 호스팅 서비스 비교

| 서비스 | 무료 플랜 | 제한사항 |
|--------|----------|---------|
| Railway | ✅ 있음 | 월 5달러 크레딧 |
| Render | ✅ 있음 | 15분 비활성 시 슬리프 |
| Fly.io | ✅ 있음 | 제한적 리소스 |

### 데이터베이스 옵션

호스팅 서비스에서는 SQLite 대신:
- PostgreSQL (Railway, Render 제공)
- MySQL
- SQLite (파일 시스템 사용 가능)

## ✅ 다음 단계

1. **GitHub 저장소 생성**
2. **코드 푸시**
3. **호스팅 서비스 선택**
4. **배포 및 테스트**

자세한 배포 방법은 선택한 호스팅 서비스의 문서를 참고하세요!

