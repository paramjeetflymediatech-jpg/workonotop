/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode:"class",
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14b8a6',
        secondary: '#0d9488',
       
      },
      
    },
    
  },
  plugins: [],
}
