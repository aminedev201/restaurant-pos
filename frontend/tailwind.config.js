/** @type {import('tailwindcss').Config} */

const primary = {
  50:  '#fff5e6',
  100: '#ffe8cc',
  200: '#ffd199',
  300: '#ffba66',
  400: '#ffa333',
  500: '#CD5700',
  600: '#a44600',
  700: '#7b3400',
  800: '#522300',
  900: '#291100',
  950: '#1a0a00',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { primary },
    },
  },
  plugins: [
    // Injects all primary shades as CSS variables on :root
    // so index.css can reference var(--primary-500) etc. dynamically
    function ({ addBase }) {
      addBase({
        ':root': Object.fromEntries(
          Object.entries(primary).map(([shade, value]) => [
            `--primary-${shade}`,
            value,
          ])
        ),
      });
    },
  ],
};