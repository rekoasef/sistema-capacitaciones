# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

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
RUN npm ci --omit=dev

# --- ¡AQUÍ ESTÁ EL CAMBIO CLAVE! ---
# Copiamos TODO el contenido de dist a dist
COPY --from=builder /usr/src/app/dist ./dist

# Copiamos también los archivos de configuración por si acaso
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

# Usamos el comando estándar
CMD ["npm", "run", "start:prod"]