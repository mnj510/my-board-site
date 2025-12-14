FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 환경 변수 (호스팅 서비스에서 덮어쓸 수 있음)
ENV NODE_ENV=production
ENV NAS_PATH=/data
ENV JWT_SECRET=change-this-secret-key-in-production

# 서버 시작
CMD ["npm", "start"]

