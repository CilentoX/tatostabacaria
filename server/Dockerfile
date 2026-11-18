FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --production=false

# Copy source and generate Prisma client
COPY server/ .
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npx prisma migrate deploy; fi && node dist/index.js"]
