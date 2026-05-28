/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexum: {
          powder: 'var(--color-powder)',
          lime: 'var(--color-lime)',
          denim: 'var(--color-denim)',
          eggshell: 'var(--color-eggshell)',
          cerulean: 'var(--color-cerulean)',
          olympic: 'var(--color-olympic)',
        }
      },
      fontFamily: {
        // Substitui a fonte padrão do sistema pela Outfit para textos gerais
        sans: ['Outfit', 'sans-serif'],
        // Cria a classe font-title para usar a Bebas Neue
        title: ['"Bebas Neue"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}