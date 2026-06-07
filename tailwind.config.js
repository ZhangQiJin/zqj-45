/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        earth: {
          50: '#F9F7F3',
          100: '#F5F0E6',
          200: '#E8DFCE',
          300: '#D4C4A8',
          400: '#B8A67F',
          500: '#9C8A5E',
          600: '#7D6E4A',
          700: '#5F5439',
          800: '#4A3F35',
          900: '#352D27',
        },
        sage: {
          50: '#F4F8F4',
          100: '#E6EFE6',
          200: '#CBDFCB',
          300: '#A5C7A5',
          400: '#7BA87B',
          500: '#5B8C5A',
          600: '#4A734A',
          700: '#3D5D3D',
          800: '#324B32',
          900: '#293D29',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#FBE8E1',
          200: '#F6D0C3',
          300: '#EFB09A',
          400: '#E48E72',
          500: '#D4846F',
          600: '#BF6A55',
          700: '#9F5645',
          800: '#83483B',
          900: '#6C3E33',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(74, 63, 53, 0.08)',
        'soft-hover': '0 8px 30px rgba(74, 63, 53, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
