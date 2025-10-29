// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Añadimos el dominio de Crucianelli a la lista de dominios permitidos
    domains: ['www.crucianelli.com'],
  },
};

module.exports = nextConfig;