# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos la misma versión de Node que el frontend para consistencia
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiar los package.json y package-lock.json
COPY package*.json ./

# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
# Copiar el schema de Prisma ANTES de instalar
# para que el 'postinstall' (prisma generate) funcione.
COPY prisma ./prisma

# Instalar dependencias (ahora 'npm ci' funcionará)
RUN npm ci

# Copiar el resto del código fuente (sobrescribirá 'prisma' y 'package.json', pero no importa)
COPY . .

# Compilar la aplicación (TypeScript a JavaScript)
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
# Empezamos desde una imagen limpia
FROM node:18-alpine

WORKDIR /usr/src/app

# Establecer el entorno de producción
ENV NODE_ENV production

# Copiar los package.json y package-lock.json de producción
COPY package*.json ./

# Instalar SOLAMENTE las dependencias de producción
# Usamos 'npm ci' y filtramos las devDependencies
RUN npm ci --omit=dev

# Copiar la build (JS compilado) de la etapa 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Copiar el schema de Prisma (necesario para las migraciones en producción)
COPY --from=builder /usr/src/app/prisma ./prisma

# Exponer el puerto
EXPOSE 3001

# El comando por defecto (que Render anulará)
# Lo dejamos como 'start:prod'
CMD ["npm", "run", "start:prod"]