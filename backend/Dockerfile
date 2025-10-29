# Usamos la imagen estándar y robusta de Node.
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

# Instalamos TODAS las dependencias
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]