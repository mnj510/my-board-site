# ✅ 모든 데이터 자동 저장 확인

## 현재 저장 상태

### ✅ 모든 데이터가 NAS에 자동 저장됩니다!

**저장 위치**: `/Volumes/site/data/database.db` (Synology NAS)

## 저장되는 모든 데이터

### 1. ✅ 로그인/회원가입 정보
- **테이블**: `profiles`
- **저장 내용**:
  - 사용자명 (username)
  - 이메일 (email)
  - 비밀번호 해시 (password_hash)
  - 관리자 여부 (is_admin)
  - 가입일 (created_at)
- **저장 시점**: 회원가입 시 즉시 저장

### 2. ✅ 관리자 게시판 추가 (카테고리)
- **테이블**: `categories`
- **저장 내용**:
  - 카테고리 이름 (name)
  - 카테고리 슬러그 (slug)
  - 생성일 (created_at)
- **저장 시점**: 관리자가 카테고리 추가 시 즉시 저장

### 3. ✅ 게시물
- **테이블**: `posts`
- **저장 내용**:
  - 제목 (title)
  - 내용 (content) - 모든 텍스트
  - 카테고리 ID (category_id)
  - 썸네일 이미지 URL (thumbnail_url)
  - 작성자 ID (author_id)
  - 작성일/수정일 (created_at, updated_at)
- **저장 시점**: 게시글 작성/수정 시 즉시 저장

### 4. ✅ 이미지
- **저장 방식**: 이미지 URL을 데이터베이스에 저장
- **저장 위치**: `posts.thumbnail_url` 필드
- **참고**: 현재는 외부 이미지 URL만 지원 (이미지 파일 직접 업로드는 추후 추가 가능)

### 5. ✅ 댓글
- **테이블**: `comments`
- **저장 내용**:
  - 댓글 내용 (content) - 모든 텍스트
  - 게시글 ID (post_id)
  - 부모 댓글 ID (parent_id) - 대댓글용
  - 작성자 ID (author_id)
  - 작성일/수정일 (created_at, updated_at)
- **저장 시점**: 댓글 작성/수정 시 즉시 저장

### 6. ✅ 사용자 권한 설정
- **테이블**: `post_permissions`
- **저장 내용**:
  - 사용자 ID (user_id)
  - 게시글 작성 권한 (can_write)
- **저장 시점**: 관리자가 권한 설정 시 즉시 저장

## 자동 저장 확인

### 모든 API가 자동으로 NAS에 저장:

1. **회원가입** (`/api/auth/signup`)
   - ✅ `getDb()` 사용 → NAS에 저장

2. **로그인** (`/api/auth/login`)
   - ✅ 데이터 읽기 → NAS에서 읽음

3. **게시글 작성** (`/api/posts`)
   - ✅ `getDb()` 사용 → NAS에 저장

4. **게시글 수정** (`/api/posts/[id]`)
   - ✅ `getDb()` 사용 → NAS에 저장

5. **댓글 작성** (`/api/comments`)
   - ✅ `getDb()` 사용 → NAS에 저장

6. **댓글 수정** (`/api/comments/[id]`)
   - ✅ `getDb()` 사용 → NAS에 저장

7. **카테고리 추가** (`/api/categories`)
   - ✅ `getDb()` 사용 → NAS에 저장

8. **권한 설정** (`/api/users/[id]/permissions`)
   - ✅ `getDb()` 사용 → NAS에 저장

## 저장 경로 확인

```bash
# 데이터베이스 파일 위치
/Volumes/site/data/database.db

# 환경 변수 확인
cat .env.local | grep NAS_PATH
# 출력: NAS_PATH=/Volumes/site/data
```

## 실시간 저장 확인 방법

### 방법 1: 데이터베이스 직접 확인
```bash
# 게시글 수 확인
sqlite3 /Volumes/site/data/database.db "SELECT COUNT(*) FROM posts;"

# 댓글 수 확인
sqlite3 /Volumes/site/data/database.db "SELECT COUNT(*) FROM comments;"

# 사용자 수 확인
sqlite3 /Volumes/site/data/database.db "SELECT COUNT(*) FROM profiles;"
```

### 방법 2: 관리자 페이지에서 확인
관리자로 로그인 후 다음 API 호출:
```
GET /api/admin/verify-storage
```

## ✅ 결론

**모든 데이터는 자동으로 NAS에 저장됩니다!**

- ✅ 회원가입 → 즉시 NAS 저장
- ✅ 로그인 정보 → NAS에서 읽기
- ✅ 게시글 작성 → 즉시 NAS 저장
- ✅ 댓글 작성 → 즉시 NAS 저장
- ✅ 카테고리 추가 → 즉시 NAS 저장
- ✅ 권한 설정 → 즉시 NAS 저장
- ✅ 모든 텍스트 → NAS에 저장
- ✅ 이미지 URL → NAS에 저장

**추가 작업 불필요** - 이미 자동 저장이 작동 중입니다!

## 데이터 영구 보존

- 서버를 재시작해도 데이터는 유지됩니다
- 다른 기기에서 접속해도 같은 데이터를 볼 수 있습니다
- NAS에 저장되므로 안전하게 보관됩니다

