/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'brand-red': {
          50: '#fff0f0',
          100: '#ffdede',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}