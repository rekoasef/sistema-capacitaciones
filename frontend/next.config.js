// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // <-- 1. AÑADIR ESTA LÍNEA
}

module.exports = nextConfig