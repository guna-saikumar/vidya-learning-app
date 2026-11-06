/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#b95d3f',
        primaryDark: '#91452f',
        primaryLight: '#f3d9cc',
        palePeach: '#fbece3',
        palePeachHover: '#f5dcd0',
        surfaceSoft: '#fdf9f7',
        borderWarm: '#ede1d8',
        borderSecondary: '#e6d6ce',
        textPrimary: '#3a2d29',
        textSecondary: '#79675f',
        textMuted: '#9b8981',
        textPlaceholder: '#a99a93',
        success: '#24845d',
        error: '#b84040',
        errorBg: '#ffdad6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(58, 45, 41, 0.06), 0 1px 2px rgba(58, 45, 41, 0.04)',
        warm: '0 2px 8px rgba(58, 45, 41, 0.08)',
      },
    },
  },
  plugins: [],
};