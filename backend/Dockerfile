# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos 'slim' (Debian) que es más compatible que Alpine
FROM node:18-slim AS builder

WORKDIR /usr/src/app

# --- ¡CORRECCIÓN CRÍTICA! ---
# Actualizamos los repositorios e instalamos OpenSSL y certificados.
# Esto permite que Prisma detecte "openssl-3.0.x" correctamente y no falle intentando bajar la 1.1.x.
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar el schema antes de instalar
COPY prisma ./prisma

# --- WORKAROUND ---
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# --- INSTALACIÓN ---
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalar OpenSSL en producción también para que el cliente de Prisma funcione al ejecutarse
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./

# Copiar Prisma y dependencias
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