# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos 'bullseye-slim' (Debian 11) que usa OpenSSL 1.1 (más compatible)
FROM node:18-bullseye-slim AS builder

WORKDIR /usr/src/app

# Instalamos dependencias básicas y OpenSSL 1.1
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar el schema
COPY prisma ./prisma

# Workaround para Prisma
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalación de dependencias
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-bullseye-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalamos OpenSSL en producción
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar Prisma y dependencias
COPY --from=builder /usr/src/app/prisma ./prisma

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalación de dependencias de producción
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]