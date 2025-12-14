# 게시판 사이트

심플하고 직관적인 게시판 사이트입니다. 개인 NAS에 데이터를 저장합니다.

## 주요 기능

- ✅ 로그인/회원가입
- ✅ 게시글 작성, 수정, 삭제
- ✅ 카테고리별 게시글 관리
- ✅ 썸네일 이미지 설정
- ✅ 댓글 및 대댓글 기능
- ✅ 댓글 수정/삭제
- ✅ 관리자 기능
  - 사용자별 게시글 작성 권한 관리
  - 카테고리 관리
  - 댓글 삭제

## 기술 스택

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- JWT 인증

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정 (선택사항):
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:
```
NAS_PATH=/path/to/your/nas
JWT_SECRET=your-secret-key-change-in-production
```

**참고**: 
- `NAS_PATH`를 설정하지 않으면 프로젝트 폴더의 `data` 디렉토리에 데이터베이스가 저장됩니다.
- `JWT_SECRET`을 설정하지 않으면 기본값이 사용되지만, 프로덕션에서는 반드시 변경하세요.

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 관리자 계정 설정

관리자 계정을 설정하려면 SQLite 데이터베이스를 직접 수정하거나, 다음 방법을 사용하세요:

1. 회원가입으로 계정 생성
2. 데이터베이스 파일 위치: `data/database.db` (또는 NAS_PATH로 설정한 경로)
3. SQLite 클라이언트로 다음 쿼리 실행:
```sql
UPDATE profiles SET is_admin = 1 WHERE email = 'your_admin_email@example.com';
```

또는 Node.js 스크립트로 실행:
```bash
node -e "const db = require('better-sqlite3')('./data/database.db'); db.prepare('UPDATE profiles SET is_admin = 1 WHERE email = ?').run('your_admin_email@example.com');"
```

## 데이터 저장 위치

- 기본: 프로젝트 폴더의 `data/database.db`
- NAS 사용: `.env.local`에 `NAS_PATH` 환경 변수 설정

## 배포

GitHub와 개인 NAS를 사용하여 배포할 수 있습니다.

1. GitHub에 코드를 푸시
2. NAS에 프로젝트 클론
3. 환경 변수 설정
4. `npm run build && npm start`로 프로덕션 빌드 실행

## 문제 해결

### 접속이 안 될 때
1. 개발 서버가 실행 중인지 확인: `npm run dev`
2. 포트 3000이 사용 중인지 확인
3. 브라우저에서 `http://localhost:3000` 접속

### 데이터베이스 오류
1. `data` 폴더의 권한 확인
2. NAS 경로가 올바른지 확인
3. SQLite 파일이 손상되지 않았는지 확인
