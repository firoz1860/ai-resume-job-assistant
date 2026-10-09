/** @type {import('tailwindcss').Config} */

// ── CareerOS design tokens ────────────────────────────────────────────────
// Palette: warm ivory canvas, white cards, forest-green primary, soft-lime
// accent (dark text only), sage secondary text, hairline borders.
// Legacy token names (navy / accent / violet / cyan / surface / ink / muted /
// border) are intentionally kept and remapped onto the new palette so every
// existing page restyles cohesively without per-page edits.

const forest = {
  DEFAULT: '#153D2B',
  50: '#EEF4EF',
  100: '#D8E6DC',
  200: '#AFCBB8',
  300: '#7FAE90',
  400: '#4C8666',
  500: '#255B40',
  600: '#1C4D34',
  700: '#153D2B',
  800: '#102F21',
  900: '#0A1F16',
  950: '#061009',
};

const lime = {
  DEFAULT: '#D4ED8A',
  50: '#F6FBE8',
  100: '#EDF7CF',
  200: '#E2F2B2',
  300: '#D4ED8A',
  400: '#C2E163',
  500: '#A8CE3F',
};

const sage = {
  DEFAULT: '#56635A',
  400: '#7E8A82',
  500: '#56635A',
  600: '#47534B',
};

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
        forest,
        lime,
        sage,
        ivory: '#F5F4EE',

        // ── Legacy aliases remapped to the new palette ──
        // navy.* was the old dark brand scale → now the forest scale.
        navy: {
          950: forest[950],
          900: forest[700], // brand wordmark / headings
          800: forest[600],
          700: forest[500],
        },
        // accent.* was electric blue → now forest green (primary action).
        accent: {
          DEFAULT: forest[700],
          50: forest[50],
          400: forest[400],
          500: forest[500],
          600: forest[600],
          700: forest[800],
        },
        // violet/cyan survived only inside old gradients → fold into palette.
        violet: {
          400: forest[400],
          500: forest[500],
          600: forest[600],
        },
        cyan: {
          400: lime[400],
          500: lime[500],
        },

        surface: '#F5F4EE',
        card: '#FFFFFF',
        ink: '#17251E',
        muted: '#56635A',
        border: '#DDE2D8',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        panel: '1.5rem', // 24px — large marketing panels
        card: '0.875rem', // 14px — workspace cards
      },
      backgroundImage: {
        // Restrained: a quiet forest wash, not a rainbow gradient.
        'brand-gradient': 'linear-gradient(130deg, #1C4D34 0%, #153D2B 60%, #102F21 100%)',
        'brand-radial': 'radial-gradient(120% 120% at 0% 0%, #255B40 0%, #153D2B 55%, #0A1F16 100%)',
        'lime-wash': 'linear-gradient(130deg, #E2F2B2 0%, #D4ED8A 100%)',
        aurora:
          'radial-gradient(60rem 42rem at 85% -10%, rgba(212,237,138,0.35), transparent 60%), radial-gradient(52rem 42rem at 8% 6%, rgba(21,61,43,0.10), transparent 55%)',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 47 33 / 0.05), 0 1px 2px -1px rgb(16 47 33 / 0.04)',
        'card-hover': '0 10px 30px -14px rgb(16 47 33 / 0.22)',
        soft: '0 18px 50px -24px rgb(16 47 33 / 0.22)',
        glow: '0 1px 2px rgb(16 47 33 / 0.06), 0 18px 48px -22px rgb(21 61 43 / 0.35)',
        'glow-violet': '0 18px 48px -22px rgb(21 61 43 / 0.4)',
        lift: '0 24px 60px -28px rgb(16 47 33 / 0.3)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        auroraShift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-2%,0) scale(1.04)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.98) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        'aurora-shift': 'auroraShift 16s ease-in-out infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
