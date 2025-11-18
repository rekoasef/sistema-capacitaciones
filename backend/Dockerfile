# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Copiar el schema antes de instalar
COPY prisma ./prisma

# Instalar dependencias
RUN npm ci

COPY . .

RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV production

# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
# Instalamos OpenSSL necesario para que Prisma funcione en Alpine Linux
RUN apk add --no-cache openssl

COPY package*.json ./

# Copiamos prisma antes de instalar para el postinstall
COPY --from=builder /usr/src/app/prisma ./prisma

# Instalar dependencias de producción
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001

CMD ["npm", "run", "start:prod"]