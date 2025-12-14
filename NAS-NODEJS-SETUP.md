# 🚀 Synology NAS에서 Node.js로 서버 실행하기

## ✅ 좋은 소식: Node.js v18이 이미 설치되어 있습니다!

Docker 없이도 Node.js로 직접 서버를 실행할 수 있습니다.

## 📋 단계별 설정

### 1단계: 프로젝트 파일을 NAS에 복사

#### 방법 A: SSH로 GitHub에서 클론 (권장)

1. **SSH 활성화**:
   - Synology Control Panel > Terminal & SNMP
   - SSH 서비스 활성화
   - 포트 확인 (기본: 22)

2. **Mac 터미널에서 SSH 접속**:
   ```bash
   ssh 사용자명@192.168.219.55
   ```

3. **프로젝트 클론**:
   ```bash
   # site 폴더로 이동
   cd /volume1/site
   
   # GitHub에서 클론
   git clone https://github.com/mnj510/my-board-site.git
   
   # 프로젝트 폴더로 이동
   cd my-board-site
   ```

#### 방법 B: 파일 직접 복사

1. Mac에서 Finder로 NAS의 `site` 폴더 열기
2. 프로젝트 폴더 전체를 `site` 폴더에 복사
3. NAS에서 파일 확인

### 2단계: 의존성 설치

SSH로 NAS 접속 후:

```bash
cd /volume1/site/my-board-site

# Node.js 버전 확인
node -v
# v18.x.x가 나와야 함

# npm 버전 확인
npm -v

# 의존성 설치
npm install
```

### 3단계: 환경 변수 설정

`.env` 파일 생성:

```bash
cd /volume1/site/my-board-site
nano .env
```

내용 입력:
```
NAS_PATH=/volume1/site/data
JWT_SECRET=your-secret-key-change-this-to-long-random-string
NODE_ENV=production
```

저장: `Ctrl + X` > `Y` > `Enter`

### 4단계: 프로젝트 빌드

```bash
cd /volume1/site/my-board-site
npm run build
```

### 5단계: PM2로 서버 실행 (백그라운드)

#### PM2 설치

```bash
# 전역으로 PM2 설치
npm install -g pm2
```

#### 서버 시작

```bash
cd /volume1/site/my-board-site

# 서버 시작
pm2 start npm --name "my-board-site" -- start

# 상태 확인
pm2 status

# 로그 확인
pm2 logs my-board-site
```

#### 부팅 시 자동 시작 설정

```bash
# PM2 시작 스크립트 생성
pm2 startup

# 현재 프로세스 저장
pm2 save
```

### 6단계: 접속 확인

#### 내부 네트워크에서:
```
http://192.168.219.55:3000
```

#### 다른 기기에서:
```
http://192.168.219.55:3000
```

## 🔧 문제 해결

### Node.js 경로를 찾을 수 없을 때

```bash
# Node.js 경로 확인
which node
which npm

# 경로가 /usr/local/bin이 아닐 수 있음
# 전체 경로 사용
/usr/local/bin/node --version
```

### npm install이 실패할 때

```bash
# npm 캐시 정리
npm cache clean --force

# 다시 설치
npm install
```

### 포트 3000이 이미 사용 중일 때

```bash
# 포트 사용 확인
netstat -tuln | grep 3000

# 다른 포트 사용 (package.json 수정 필요)
# 또는 기존 프로세스 종료
```

### PM2가 작동하지 않을 때

```bash
# PM2 재설치
npm uninstall -g pm2
npm install -g pm2

# 또는 직접 실행
cd /volume1/site/my-board-site
node_modules/.bin/next start
```

## 📊 서버 관리 명령어

### PM2 명령어

```bash
# 서버 상태 확인
pm2 status

# 서버 재시작
pm2 restart my-board-site

# 서버 중지
pm2 stop my-board-site

# 서버 시작
pm2 start my-board-site

# 로그 확인
pm2 logs my-board-site

# 로그 실시간 확인
pm2 logs my-board-site --lines 50

# 서버 삭제
pm2 delete my-board-site
```

## 🌐 외부 접속 설정 (선택사항)

### 포트 포워딩

라우터에서:
- 외부 포트: 3000
- 내부 IP: 192.168.219.55
- 내부 포트: 3000

### DDNS 설정

1. Synology Control Panel > External Access > DDNS
2. DDNS 서비스 선택
3. 호스트 이름 설정

## ✅ 확인 체크리스트

- [ ] SSH 활성화
- [ ] 프로젝트 파일 NAS에 복사
- [ ] npm install 완료
- [ ] .env 파일 생성
- [ ] npm run build 완료
- [ ] PM2로 서버 시작
- [ ] 접속 테스트
- [ ] 부팅 시 자동 시작 설정

## 🎯 빠른 시작 스크립트

NAS의 프로젝트 폴더에 `start.sh` 파일 생성:

```bash
#!/bin/bash
cd /volume1/site/my-board-site
export NAS_PATH=/volume1/site/data
export JWT_SECRET=your-secret-key
export NODE_ENV=production
pm2 start npm --name "my-board-site" -- start
```

실행 권한 부여:
```bash
chmod +x start.sh
```

실행:
```bash
./start.sh
```

## 💡 팁

1. **로그 모니터링**: `pm2 logs my-board-site`로 실시간 확인
2. **재시작**: 코드 업데이트 후 `pm2 restart my-board-site`
3. **백업**: 데이터베이스 파일 정기 백업
4. **업데이트**: GitHub에서 `git pull` 후 재빌드

이제 컴퓨터를 꺼도 사이트가 계속 작동합니다!

