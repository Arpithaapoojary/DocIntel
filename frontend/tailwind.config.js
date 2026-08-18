/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy tokens (kept for compatibility)
        paper: '#F7F6FB',
        ink: '#0F0E1A',
        surface: '#FFFFFF',
        line: '#E5E3F0',
        signal: {
          DEFAULT: '#6C3AFF',
          light: '#8B5CF6',
          dark: '#A78BFA',
        },
        flag: {
          DEFAULT: '#E05050',
          light: '#F87171',
        },
        'paper-dark': '#08060F',
        'surface-dark': '#100D1E',
        'ink-dark': '#EAE8F5',
        'line-dark': '#1E1B30',

        // New vibrant palette
        primary: {
          50:  '#f0ebff',
          100: '#ddd3ff',
          200: '#c0a9ff',
          300: '#9d78ff',
          400: '#7c4fff',
          DEFAULT: '#6C3AFF',
          600: '#5a2ee0',
          700: '#4720c4',
          800: '#3618a0',
          900: '#27127f',
        },
        accent: {
          DEFAULT: '#00D4FF',
          dark:    '#00A8CC',
        },
        success: {
          DEFAULT: '#10B981',
          dark:    '#34D399',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark:    '#F87171',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark:    '#FBBF24',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Fraunces"', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary':  'linear-gradient(135deg, #6C3AFF 0%, #00D4FF 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #5a2ee0 0%, #00A8CC 100%)',
        'gradient-dark':     'linear-gradient(135deg, #08060F 0%, #100D1E 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(108,58,255,0.08) 0%, rgba(0,212,255,0.05) 100%)',
        'gradient-glow':     'radial-gradient(ellipse at center, rgba(108,58,255,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(108,58,255,0.35)',
        'glow-accent':  '0 0 20px rgba(0,212,255,0.35)',
        'glow-sm':      '0 0 10px rgba(108,58,255,0.2)',
        'glass':        '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-dark':   '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':         '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover':   '0 8px 30px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.06)',
        'card-dark':    '0 2px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        'card-dark-hover': '0 8px 30px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'fade-in-up':   'fadeInUp 0.5s ease-out',
        'slide-in-left':'slideInLeft 0.4s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'bounce-dots':  'bounceDots 1.4s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108,58,255,0.2)' },
          '50%':      { boxShadow: '0 0 25px rgba(108,58,255,0.5)' },
        },
        bounceDots: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%':           { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
