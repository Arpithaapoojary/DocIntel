/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Theme Tokens
        paper: {
          DEFAULT: '#F8FAFC',
          dark:    '#090D16',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover:   '#F1F5F9',
          dark:    '#111726',
          'dark-hover': '#182033',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted:   '#64748B',
          dark:    '#F1F5F9',
          'dark-muted': '#94A3B8',
        },
        line: {
          DEFAULT: '#E2E8F0',
          dark:    '#1E293B',
        },

        // Brand colors
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          DEFAULT: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        accent: {
          50:  '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          DEFAULT: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
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
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary':  'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #4F46E5 0%, #0891B2 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(99,102,241,0.06) 0%, rgba(6,182,212,0.04) 100%)',
        'gradient-dark-card':'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)',
        'gradient-glow':     'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
        'mesh-glow':         'radial-gradient(at 100% 0%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(6,182,212,0.12) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-primary': '0 0 24px -2px rgba(99,102,241,0.4)',
        'glow-accent':  '0 0 24px -2px rgba(6,182,212,0.35)',
        'glow-sm':      '0 0 12px 0 rgba(99,102,241,0.25)',
        'glass':        '0 8px 32px 0 rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
        'glass-dark':   '0 8px 32px 0 rgba(0,0,0,0.37), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':         '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':   '0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'card-dark':    '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.3)',
        'card-dark-hover': '0 12px 28px -4px rgba(0,0,0,0.6), 0 6px 10px -4px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in':      'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up':   'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left':'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':      'shimmer 2.2s infinite',
        'pulse-glow':   'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1', transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
}
