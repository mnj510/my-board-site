# Synology NAS 설정 완료 가이드

## 공유 폴더 정보
- **NAS 주소**: 192.168.219.55
- **공유 폴더 이름**: site
- **웹 인터페이스**: https://192.168.219.55:5001

## 1단계: macOS에서 SMB 공유 마운트

### 방법 1: Finder 사용 (가장 간단)

1. **Finder 열기**
2. 메뉴바에서 **이동 > 서버에 연결** (또는 `Cmd + K` 단축키)
3. 주소 입력창에 입력: `smb://192.168.219.55`
4. **연결** 버튼 클릭
5. Synology NAS 사용자명과 비밀번호 입력
6. 연결할 공유 폴더 목록에서 **"site"** 선택
7. 마운트 완료!

### 방법 2: 터미널 사용

```bash
# 마운트 포인트 생성
mkdir -p ~/NAS-site

# SMB 공유 마운트 (사용자명과 비밀번호 입력 필요)
mount_smbfs //사용자명:비밀번호@192.168.219.55/site ~/NAS-site
```

## 2단계: 마운트 확인

터미널에서 다음 명령어로 확인:

```bash
ls /Volumes/site
```

또는

```bash
ls ~/NAS-site
```

폴더 내용이 보이면 성공입니다!

## 3단계: 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. 

만약 다른 경로에 마운트했다면 `.env.local` 파일을 수정하세요:

```bash
# 기본 경로 (Finder로 마운트한 경우)
NAS_PATH=/Volumes/site/data

# 또는 터미널로 마운트한 경우
NAS_PATH=~/NAS-site/data
```

## 4단계: 데이터베이스 폴더 생성

마운트된 NAS에 데이터베이스 저장 폴더를 생성합니다:

```bash
# Finder로 마운트한 경우
mkdir -p /Volumes/site/data

# 터미널로 마운트한 경우
mkdir -p ~/NAS-site/data
```

## 5단계: 개발 서버 재시작

환경 변수를 적용하려면 개발 서버를 재시작하세요:

```bash
# 현재 실행 중인 서버 중지 (Ctrl + C)
# 그 다음 다시 시작
npm run dev
```

## 자동 마운트 설정 (선택사항)

시스템 재시작 후에도 자동으로 마운트하려면:

### 방법 1: 시스템 설정 사용
1. 시스템 설정 > 일반 > 로그인 항목
2. 마운트 스크립트 추가

### 방법 2: launchd 사용
`~/Library/LaunchAgents/com.nas.mount.plist` 파일 생성:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nas.mount</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/osascript</string>
        <string>-e</string>
        <string>mount volume "smb://192.168.219.55/site"</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

## 문제 해결

### 마운트가 안 될 때
1. Synology NAS가 켜져 있는지 확인
2. 네트워크 연결 확인: `ping 192.168.219.55`
3. SMB 서비스가 활성화되어 있는지 확인 (Synology 제어판)
4. 방화벽 설정 확인

### 권한 오류가 발생할 때
1. Synology NAS에서 사용자에게 "site" 폴더 접근 권한 확인
2. 읽기/쓰기 권한이 있는지 확인

### 경로를 찾을 수 없을 때
1. 마운트가 제대로 되었는지 확인: `ls /Volumes/`
2. `.env.local` 파일의 `NAS_PATH` 경로 확인
3. 폴더가 실제로 존재하는지 확인

## 확인 사항

설정이 완료되면 다음을 확인하세요:

1. ✅ NAS 마운트 확인: `ls /Volumes/site`
2. ✅ 환경 변수 확인: `cat .env.local`
3. ✅ 개발 서버 실행: `npm run dev`
4. ✅ 데이터베이스 파일 생성 확인: `ls /Volumes/site/data/`

데이터베이스 파일(`database.db`)이 `/Volumes/site/data/` 경로에 생성되면 성공입니다!
