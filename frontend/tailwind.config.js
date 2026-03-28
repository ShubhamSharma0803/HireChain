/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mmOrange: '#FF8131',
        mmNavy: '#030D1E',
        mmGray: '#6A737D',
        mmLightGray: '#F2F4F6',
      },
    },
  },
  plugins: [],
};
