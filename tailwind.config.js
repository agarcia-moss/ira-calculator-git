/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          primary: {
            green: '#026837',
            gold: '#886e4b',
          },
          monochrome: {
            'deep-fern': '#02351b',
            'pine-vault': '#054f2a',
            'mint-vale': '#5ab48b',
            'sage-veil': '#a3d3bd',
            'mist-canopy': '#e6f4ec',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 