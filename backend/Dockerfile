# Multi-stage Dockerfile for Backend API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/uploads/resumes && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
