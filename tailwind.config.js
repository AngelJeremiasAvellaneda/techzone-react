// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}", // Añade esta línea
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}