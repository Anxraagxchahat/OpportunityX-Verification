/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          hover: 'var(--color-surface-hover)',
        },
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: {
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
        },
        accent: {
          brand: 'var(--color-accent-brand)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
          glow: 'var(--color-accent-glow)',
        },
        focus: {
          ring: 'var(--color-focus-ring)',
        },
        // Brand Raw Tokens
        oppxOrange: {
          400: '#FF8533',
          500: '#FF6B00',
          600: '#EA580C',
        },
        // Legacy fallbacks for compatibility
        bgDark: '#000000',
        bgCard: '#121215',
        bgCardHover: '#18181B',
        oxPrimary: {
          DEFAULT: '#FF6B00',
          hover: '#EA580C',
        },
        oxGreen: '#10B981',
        oxRed: '#EF4444',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Satoshi', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'ox-sm': '8px',
        'ox-md': '14px',
        'ox-lg': '24px',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        elevated: 'var(--shadow-elevated)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fade-up': 'fadeUp 0.35s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
        'soft-in': 'softIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.99)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
      },
    },
  },
  plugins: [],
};
