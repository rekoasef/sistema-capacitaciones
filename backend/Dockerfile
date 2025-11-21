# backend/Dockerfile

# --- 1. ETAPA DE BUILD (Builder) ---
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Instalar OpenSSL y Procps (Necesario para Prisma/Node Watcher)
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates procps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copiamos los archivos de configuración
COPY package.json ./

# Borramos el package-lock.json para obligar a npm a buscar la versión NUEVA
RUN rm -f package-lock.json

COPY prisma ./prisma

# Variable para evitar errores de integridad si la red falla un poco
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalamos dependencias desde cero
RUN npm install

COPY . .
RUN npm run build

# --- 2. ETAPA DE PRODUCCIÓN (Runner) ---
FROM node:20-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

# Instalar OpenSSL y Procps en producción
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates procps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# --- FIX CLAVE: Instalar NEST CLI globalmente para que el 'start:dev' funcione ---
RUN npm install -g @nestjs/cli

COPY package.json ./
# Borramos lockfile aquí también por seguridad
RUN rm -f package-lock.json

# Copiamos los archivos de Prisma generados
COPY --from=builder /usr/src/app/prisma ./prisma

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Instalación limpia de producción (Esto elimina dev dependencies)
RUN npm install --omit=dev

# Copiamos el build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/nest-cli.json ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
