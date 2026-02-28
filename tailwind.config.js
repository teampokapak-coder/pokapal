/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      colors: {
        // Vintage gray palette
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        pallet: {
          gold: '#d8a657',
          green: '#5a8a4a',
          copper: '#c97b4b',
          bark: '#2c2418',
          cream: '#faf5ea',
          parchment: '#f0e4cc',
          pageBg: '#0e0c0a',
          sectionBg: '#161310',
          cardBg: '#1c1814',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Dela Gothic One"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        lexend: ['"Lexend"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'pallet-fields': 'linear-gradient(135deg, #78b464, #4a7a3a)',
        'golden-hour': 'linear-gradient(135deg, #d8a657, #c97b4b)',
        'deep-bark': 'linear-gradient(135deg, #2c2418, #1a160e)',
      },
    },
  },
  plugins: [],
}

