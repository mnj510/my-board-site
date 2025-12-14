# 🖥️ Synology NAS에서 서버 실행하기

## ✅ 장점

NAS에서 서버를 실행하면:
- ✅ **컴퓨터를 꺼도 사이트 작동**
- ✅ **24/7 항상 켜져있음**
- ✅ **데이터도 NAS에 저장** (일관성)
- ✅ **어디서든 접속 가능**
- ✅ **전력 소비 적음**

## 🎯 방법 1: Docker 사용 (추천)

### 1단계: Docker 설치

1. **Synology NAS 웹 인터페이스** 접속: `https://192.168.219.55:5001`
2. **Package Center** 열기
3. **Docker** 검색 및 설치
4. 설치 완료 대기

### 2단계: 프로젝트 파일을 NAS에 복사

#### 방법 A: GitHub에서 클론 (권장)

NAS의 SSH 또는 터미널에서:

```bash
# NAS의 공유 폴더로 이동 (예: /volume1/site)
cd /volume1/site

# GitHub에서 클론
git clone https://github.com/mnj510/my-board-site.git

cd my-board-site

# 의존성 설치
npm install
```

#### 방법 B: 파일 직접 복사

1. Mac에서 NAS의 `site` 폴더에 프로젝트 복사
2. NAS에서 파일 확인

### 3단계: Dockerfile 생성

NAS의 프로젝트 폴더에 `Dockerfile` 생성:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV NAS_PATH=/data
ENV JWT_SECRET=your-secret-key-change-this

CMD ["npm", "start"]
```

### 4단계: Docker 컨테이너 실행

Docker GUI에서:
1. **Image** 탭 > **Add** > **From file** 선택
2. Dockerfile 선택하여 빌드
3. **Container** 탭 > **Create** 클릭
4. 설정:
   - **Port**: 3000:3000
   - **Volume**: `/volume1/site/data:/data` (데이터베이스 저장)
   - **Environment**: 
     - `JWT_SECRET`: 시크릿 키
     - `NAS_PATH`: `/data`
5. **Run** 클릭

## 🎯 방법 2: Node.js 직접 설치

### 1단계: Node.js 설치

1. **Package Center** 열기
2. **Node.js v20** 검색 및 설치
3. 또는 **Community** 탭에서 설치

### 2단계: 프로젝트 설정

SSH로 NAS 접속:

```bash
# SSH로 NAS 접속 (터미널에서)
ssh 사용자명@192.168.219.55

# 프로젝트 폴더로 이동
cd /volume1/site/my-board-site

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build
```

### 3단계: 환경 변수 설정

`.env` 파일 생성:

```bash
cd /volume1/site/my-board-site
nano .env
```

내용:
```
NAS_PATH=/volume1/site/data
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### 4단계: 서버 실행

#### 방법 A: PM2 사용 (권장)

```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start npm --name "my-board-site" -- start

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

#### 방법 B: 시스템 서비스로 등록

`/etc/systemd/system/my-board-site.service` 파일 생성:

```ini
[Unit]
Description=My Board Site
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/volume1/site/my-board-site
Environment="NAS_PATH=/volume1/site/data"
Environment="JWT_SECRET=your-secret-key"
Environment="NODE_ENV=production"
ExecStart=/usr/local/bin/node /volume1/site/my-board-site/node_modules/.bin/next start
Restart=always

[Install]
WantedBy=multi-user.target
```

서비스 시작:
```bash
sudo systemctl enable my-board-site
sudo systemctl start my-board-site
```

## 🌐 외부 접속 설정

### 포트 포워딩 (라우터 설정)

1. 라우터 관리 페이지 접속
2. **포트 포워딩** 설정:
   - 외부 포트: 3000 (또는 원하는 포트)
   - 내부 IP: `192.168.219.55` (NAS IP)
   - 내부 포트: 3000
3. 저장

### DDNS 설정 (선택사항)

1. Synology **Control Panel** > **External Access** > **DDNS**
2. DDNS 서비스 선택 (Synology, No-IP 등)
3. 호스트 이름 설정 (예: `myboard.ddns.net`)
4. 적용

### 방화벽 설정

1. Synology **Control Panel** > **Security** > **Firewall**
2. 포트 3000 허용 규칙 추가

## ✅ 접속 확인

### 내부 네트워크에서:
```
http://192.168.219.55:3000
```

### 외부에서 (DDNS 설정 시):
```
http://myboard.ddns.net:3000
```

또는 공인 IP 사용:
```
http://[공인IP]:3000
```

## 🔧 문제 해결

### 서버가 시작되지 않을 때

1. **로그 확인**:
   ```bash
   pm2 logs my-board-site
   # 또는
   journalctl -u my-board-site -f
   ```

2. **포트 확인**:
   ```bash
   netstat -tuln | grep 3000
   ```

3. **권한 확인**:
   ```bash
   ls -la /volume1/site/data
   ```

### 데이터베이스 오류

1. 데이터 폴더 권한 확인
2. NAS_PATH 환경 변수 확인
3. SQLite 파일 권한 확인

## 📊 비교

| 방법 | 난이도 | 장점 | 단점 |
|------|--------|------|------|
| Docker | ⭐⭐ | 격리, 관리 쉬움 | 초기 설정 필요 |
| Node.js 직접 | ⭐⭐⭐ | 완전한 제어 | 설정 복잡 |

## 💡 추천

**Docker 사용을 추천합니다:**
- 설정이 비교적 간단
- 격리된 환경
- 업데이트가 쉬움
- Synology에서 공식 지원

## ✅ 체크리스트

- [ ] Docker 또는 Node.js 설치
- [ ] 프로젝트 파일 NAS에 복사
- [ ] 환경 변수 설정
- [ ] 서버 실행
- [ ] 포트 포워딩 설정 (외부 접속 시)
- [ ] 접속 테스트

## 🚀 다음 단계

1. **Docker 설치** (Package Center)
2. **프로젝트 복사** (GitHub 클론 또는 파일 복사)
3. **Docker 컨테이너 실행**
4. **접속 테스트**

이렇게 하면 컴퓨터를 꺼도 사이트가 계속 작동합니다!

