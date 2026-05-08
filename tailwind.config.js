/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores
        'fin-dark-bg': '#0a0b10',      // Fondo ultra oscuro
        'fin-charcoal': '#16181f',     // Fondo de tarjetas y paneles
        'fin-charcoal-light': '#1e2129', // Destacados en paneles
        'fin-violet': '#8b5cf6',       // Violeta principal (neón)
        'fin-violet-dark': '#6d28d9',  // Violeta oscuro para degradados
        'fin-cyan': '#22d3ee',         // Cian principal (neón)
        'fin-cyan-dark': '#0891b2',    // Cian oscuro
        'fin-gray-text': '#94a3b8',    // Texto secundario
      },
      backgroundImage: {
        // Degradado principal del login (Violeta -> Cian)
        'fin-gradient-main': 'linear-gradient(135deg, #6d28d9 0%, #0891b2 100%)',
        // Degradado sutil para tarjetas (Charcoal -> Charcoal un poco más claro)
        'fin-gradient-card': 'linear-gradient(180deg, #16181f 0%, #1e2129 100%)',
      },
      boxShadow: {
        // Efecto neón violeta para inputs o botones enfocados
        'neon-violet': '0 0 15px rgba(139, 92, 246, 0.5)',
        // Efecto neón cian para otros elementos
        'neon-cyan': '0 0 15px rgba(34, 211, 230, 0.5)',
        // Sombra suave para las tarjetas sobre el fondo oscuro
        'fin-card': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}