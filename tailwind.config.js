/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1280px',
    },
    extend: {
      colors: {
        brandGreen: {
          50: '#E8F5EE',
          100: '#C2E3D0',
          200: '#96CCAD',
          500: '#1B6B3A',
          600: '#165A32',
          700: '#134D2A',
          900: '#0A2D18',
        },
        cocoa: {
          50: '#F5EDDF',
          100: '#E8D5B5',
          500: '#5C3D2E',
          700: '#3E2A1F',
          900: '#211510',
        },
        ochre: {
          50: '#FDF3DC',
          100: '#F8E0A0',
          500: '#C8963E',
          700: '#9A6E28',
          900: '#6B4A15',
        },
        cream: {
          light: '#F7F2EA',
          white: '#FFFFFF',
        },
        infoBlue: {
          50: '#EAF3F9',
          200: '#BBD7E8',
          700: '#1A5276',
        },
        errorRed: {
          50: '#FBE9E7',
          200: '#F5C0BA',
          700: '#C0392B',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

