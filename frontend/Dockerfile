# frontend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
# Usamos la misma versión de Node que el backend para consistencia
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar dependencias de desarrollo (necesarias para 'next build')
RUN npm install

# Copiar el resto del código fuente del frontend
COPY . .

# Construir la aplicación optimizada para producción
# Esto usará la configuración 'output: standalone' que acabamos de poner
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
# Empezamos desde una imagen limpia
FROM node:18-alpine

WORKDIR /usr/src/app

# Establecer el entorno de producción
ENV NODE_ENV production

# Copiar los artefactos de build de la etapa 'builder'
# 'output: standalone' crea una carpeta 'standalone' auto-contenida
COPY --from=builder /usr/src/app/.next/standalone ./

# Copiar las carpetas 'public' (imágenes, logo) y '.next/static' (CSS, JS)
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/static ./.next/static

# Exponer el puerto 3000
EXPOSE 3000

# El comando para iniciar el servidor de Next.js en modo 'standalone'
CMD ["node", "server.js"]