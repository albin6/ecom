/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        'base-black': '#0F0F0F',
        'surface': '#1A1A1A',
        'border-mute': '#2A2A2A',
        'accent': '#C9A96E', // Hannvis Gold
        'accent-mute': '#8B6F47',
        'text-primary': '#F0EDE8',
        'text-muted': '#888580',
        'success': '#4CAF78',
        'error': '#E05252',
        'warning': '#E0A030',
      },
      transitionDuration: {
        '600': '600ms',
      },
      transitionTimingFunction: {
        'boutique': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
