/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      boxShadow: {
        // Skill: shadows-as-borders — layered transparent shadows for natural depth
        'card':       '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06), 0px 2px 4px 0px rgba(0,0,0,0.04)',
        'card-hover': '0px 0px 0px 1px rgba(0,0,0,0.08), 0px 4px 12px -2px rgba(0,0,0,0.08), 0px 2px 4px 0px rgba(0,0,0,0.06)',
        'dropdown':   '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 8px 24px -4px rgba(0,0,0,0.12), 0px 2px 6px 0px rgba(0,0,0,0.06)',
      },
      keyframes: {
        // Skill: split + stagger enter animations
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)',    filter: 'blur(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        // Subtle spinner pulse for Loading component
        spin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 400ms cubic-bezier(0.2, 0, 0, 1) forwards',
        fadeIn:   'fadeIn 300ms ease-out forwards',
        slideIn:  'slideIn 0.3s ease-out',
        pulse:    'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionTimingFunction: {
        // Skill: use (0.2,0,0,1) as spring approximation without motion library
        'spring': 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
