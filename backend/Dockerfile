# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

# --- ¡WORKAROUND! ---
# Ignoramos el error de checksum de Prisma si su servidor falla
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalar dependencias (incluyendo devDependencies)
RUN npm ci

COPY . .

RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalar OpenSSL (necesario para Prisma en Alpine)
RUN apk add --no-cache openssl

COPY package*.json ./

# Copiar Prisma y dependencias
COPY --from=builder /usr/src/app/prisma ./prisma

# --- ¡WORKAROUND! ---
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

RUN npm ci --omit=dev

# Copiamos TODO el contenido de dist a dist
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]