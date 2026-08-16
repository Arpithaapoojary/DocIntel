/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F7F5',
        ink: '#12151C',
        surface: '#FFFFFF',
        line: '#E4E4E1',
        signal: {
          DEFAULT: '#047857',
          light: '#10B981',
          dark: '#34D399',
        },
        flag: {
          DEFAULT: '#B45309',
          light: '#D97706',
        },
        'paper-dark': '#0B0D12',
        'surface-dark': '#12151C',
        'ink-dark': '#E7E7E3',
        'line-dark': '#23262E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
