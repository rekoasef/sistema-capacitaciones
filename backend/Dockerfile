# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos la imagen 'slim' basada en Debian, más compatible que Alpine
FROM node:18-slim AS builder

WORKDIR /usr/src/app

# --- INSTALACIÓN DE DEPENDENCIAS DEL SISTEMA ---
# Esto es CRÍTICO para que Prisma detecte correctamente OpenSSL 3.0
# y no intente buscar versiones viejas (1.1.x) que causan errores.
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar el schema antes de instalar
COPY prisma ./prisma

# --- WORKAROUND ---
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# --- INSTALACIÓN NPM ---
# Al haber fijado la versión en package.json, esto instalará la v5.15.0 estable
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalar OpenSSL también en producción para que el cliente Prisma funcione al arrancar
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar Prisma y dependencias generadas
COPY --from=builder /usr/src/app/prisma ./prisma

# --- WORKAROUND ---
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# --- INSTALACIÓN PROD ---
RUN npm install --omit=dev

# Copiamos los artefactos construidos
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]