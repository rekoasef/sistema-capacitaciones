const config = { // El archivo comienza directamente con 'const'
  // Asegura el escaneo de archivos en la estructura /src y raíz
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // COLORES OFICIALES DE CRUCIANELLI
        'crucianelli-primary': '#CC0000', // Rojo Industrial Dominante
        'crucianelli-secondary': '#073949', // Azul Marino Corporativo
        'admin-bg': '#F4F6F9', // Fondo claro para paneles administrativos
      },
    },
  },
  plugins: [],
}

module.exports = config; // Sintaxis CommonJS (module.exports) para máxima compatibilidad con PostCSS/Webpack