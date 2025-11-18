# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos Node 20 (LTS actual) con Debian Slim
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Instalamos OpenSSL y certificados (Crucial para Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiamos prisma antes de instalar
COPY prisma ./prisma

# Variable para evitar errores de checksum en descargas fallidas
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalamos dependencias
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:20-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalamos OpenSSL también en producción
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiamos archivos necesarios de Prisma
COPY --from=builder /usr/src/app/prisma ./prisma

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos el build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]