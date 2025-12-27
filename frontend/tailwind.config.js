/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#461D3A',
          800: '#502A50',
          600: '#7E2A53',
          400: '#BA71A2',
          100: '#ECD0EC',
        },
      },
    },
  },
  plugins: [],
}


