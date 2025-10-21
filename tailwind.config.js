/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",           // Εδώ λέει στο Tailwind να ψάξει για classes στο index.html
    "./app.js"               // Και στο app.js (για τις δυναμικές classes)
  ],
  theme: {
    extend: {
      colors: {
        // Μπορούμε να προσθέσουμε custom colors αργότερα αν χρειαστεί
      }
    },
  },
  plugins: [],
}