/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Apple-inspired comprehensive breakpoint system
        'xs': '320px',        // Small phones (iPhone SE)
        'xxs': '375px',       // Standard phones (iPhone 12/13 mini)
        'sm': '390px',        // iPhone 12/13/14 Pro
        'sm-plus': '428px',   // iPhone Pro Max
        'md-sm': '734px',     // Small tablets portrait
        'md': '768px',        // iPad portrait
        'md-plus': '834px',   // iPad Pro 11" portrait
        'lg': '1024px',       // iPad landscape / Small desktop
        'lg-plus': '1068px',  // iPad Pro 11" landscape
        'xl': '1194px',       // Standard desktop
        'xl-plus': '1280px',  // Large desktop
        '2xl': '1440px',      // XL desktop
        '3xl': '1920px',      // Full HD
        '4xl': '2560px',      // 4K displays
      },
      colors: {
        // Matcha color palette
        matcha: {
          50: '#f4f8f3',
          100: '#e8f2e5',
          200: '#d1e5cc',
          300: '#a8cfaa',
          400: '#7db384',
          500: '#5a9660',
          600: '#3d6e42',
          700: '#2f5435',
          800: '#1e3623',
          900: '#0f1b11',
        },
        cream: {
          50: '#fdfdfb',
          100: '#faf8f4',
          200: '#f5f1e8',
          300: '#ede6d6',
          400: '#e3d8c0',
          500: '#d4c4a8',
          600: '#b8a68a',
          700: '#9d8c72',
          800: '#7a6e5a',
          900: '#5a5245',
        },
        // Legacy colors (keeping for compatibility)
        sage: '#a8cfaa',
        navy: '#2f5435',
        grey: '#7a6e5a',
        beige: '#f5f1e8',
        primary: {
          50: '#f4f8f3',
          100: '#e8f2e5',
          200: '#d1e5cc',
          300: '#a8cfaa',
          400: '#7db384',
          500: '#5a9660',
          600: '#3d6e42',
          700: '#2f5435',
          800: '#1e3623',
          900: '#0f1b11',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
