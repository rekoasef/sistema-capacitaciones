# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Copiar el schema de Prisma ANTES de instalar
COPY prisma ./prisma

# Instalar dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación (TypeScript a JavaScript)
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV production

# Copiar los package.json y package-lock.json de producción
COPY package*.json ./

# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
# 1. Copiar el schema de Prisma (necesario para 'prisma generate')
COPY --from=builder /usr/src/app/prisma ./prisma

# 2. Instalar SOLAMENTE las dependencias de producción
# El 'postinstall' (prisma generate) ahora funcionará
RUN npm ci --omit=dev

# 3. Copiar la build (JS compilado) de la etapa 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto
EXPOSE 3001

# El comando por defecto (que Render anulará con 'start:prod:migrate')
CMD ["npm", "run", "start:prod"]