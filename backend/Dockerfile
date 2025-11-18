# backend/Dockerfile (Opción 1: Slim)

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos 'slim' que ya incluye librerías como OpenSSL
FROM node:18-slim AS builder

WORKDIR /usr/src/app

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

# No necesitamos instalar OpenSSL manualmente aquí

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