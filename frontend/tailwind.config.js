/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        navy: {
          950: '#060F22',
          900: '#0B1F3A',
          800: '#123B66',
          700: '#1B4E86',
        },
        accent: {
          DEFAULT: '#2563EB',
          50: '#EFF5FF',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        violet: {
          400: '#8B7CF6',
          500: '#6D5CF0',
          600: '#5B4BD6',
        },
        cyan: {
          400: '#38BDF8',
          500: '#06B6D4',
        },
        surface: '#F8FAFC',
        card: '#FFFFFF',
        ink: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #2563EB 0%, #6D5CF0 52%, #06B6D4 100%)',
        'brand-radial': 'radial-gradient(120% 120% at 0% 0%, #2563EB 0%, #6D5CF0 45%, #06B6D4 100%)',
        'aurora':
          'radial-gradient(60rem 40rem at 12% -10%, rgba(56,189,248,0.20), transparent 60%), radial-gradient(50rem 40rem at 100% 10%, rgba(109,92,240,0.22), transparent 55%), radial-gradient(60rem 50rem at 50% 120%, rgba(37,99,235,0.18), transparent 60%)',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10)',
        soft: '0 10px 40px -12px rgb(15 23 42 / 0.18)',
        glow: '0 0 0 1px rgb(37 99 235 / 0.12), 0 18px 60px -18px rgb(37 99 235 / 0.45)',
        'glow-violet': '0 18px 60px -18px rgb(109 92 240 / 0.5)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        auroraShift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-3%,0) scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        'aurora-shift': 'auroraShift 14s ease-in-out infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
