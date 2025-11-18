# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos 'bullseye-slim' (Debian 11) que usa OpenSSL 1.1
# Esto evita el error 500 del servidor de Prisma con la versión 3.0
FROM node:18-bullseye-slim AS builder

WORKDIR /usr/src/app

# Instalamos las dependencias de sistema necesarias
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar el schema antes de instalar
COPY prisma ./prisma

# Workaround para ignorar chequeos de integridad fallidos
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalación de paquetes
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-bullseye-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalar OpenSSL en producción
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar Prisma y dependencias
COPY --from=builder /usr/src/app/prisma ./prisma

# Workaround
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalación de dependencias de producción
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]