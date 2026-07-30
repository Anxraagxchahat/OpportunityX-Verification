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
        bgDark: '#05070D',
        bgCard: '#0B0D14',
        bgCardHover: '#10131D',
        oxPrimary: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
        },
        oxSecondary: '#EAB308',
        oxHighlight: '#F59E0B',
        oxGreen: '#10B981',
        oxRed: '#ef4444',
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'ox-sm': '8px',
        'ox-md': '14px',
        'ox-lg': '24px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'soft-in': 'softIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-glow': 'cyberBorderPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        cyberBorderPulse: {
          '0%, 100%': { borderColor: 'rgba(234, 179, 8, 0.15)', boxShadow: '0 0 12px rgba(234, 179, 8, 0.08)' },
          '50%': { borderColor: 'rgba(249, 115, 22, 0.3)', boxShadow: '0 0 24px rgba(249, 115, 22, 0.18)' },
        }
      }
    },
  },
  plugins: [],
}
