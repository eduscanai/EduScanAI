import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Accents
        primary: {
          50: '#e8ecfd',
          100: '#d1d9fb',
          200: '#a3b3f7',
          300: '#758df3',
          400: '#4367ef',
          500: '#1132d4', // Primary Blue
          600: '#0e28aa',
          700: '#0a1e7f',
          800: '#071455',
          900: '#030a2a',
          950: '#020515',
        },
        'data-teal': {
          50: '#e6faf4',
          100: '#cdf5e9',
          200: '#9bebd3',
          300: '#69e1bd',
          400: '#37d7a7',
          500: '#20c997', // Data Teal
          600: '#1aa179',
          700: '#13795b',
          800: '#0d503c',
          900: '#06281e',
          950: '#03140f',
        },
        purple: {
          50: '#f3eef9',
          100: '#e7ddf3',
          200: '#cfbbe7',
          300: '#b799db',
          400: '#9f77cf',
          500: '#6f42c1', // Deep Purple
          600: '#59359a',
          700: '#432874',
          800: '#2c1a4d',
          900: '#160d27',
          950: '#0b0713',
        },

        // Semantic Status
        success: {
          50: '#e8f5ed',
          100: '#d1ebdb',
          200: '#a3d7b7',
          300: '#75c393',
          400: '#47af6f',
          500: '#28a745', // Success Green
          600: '#208637',
          700: '#186429',
          800: '#10431c',
          900: '#08210e',
          950: '#041107',
        },
        warning: {
          50: '#fffbeb',
          100: '#fff7d6',
          200: '#ffefad',
          300: '#ffe784',
          400: '#ffdf5b',
          500: '#ffc107', // Warning Amber
          600: '#cc9a06',
          700: '#997404',
          800: '#664d03',
          900: '#332701',
          950: '#1a1301',
        },
        critical: {
          50: '#fceaea',
          100: '#f9d5d5',
          200: '#f3abab',
          300: '#ed8181',
          400: '#e75757',
          500: '#dc3545', // Critical Red
          600: '#b02a37',
          700: '#842029',
          800: '#58151c',
          900: '#2c0b0e',
          950: '#160507',
        },

        // Text & Background
        'text-primary': '#212529', // Cor padrão de texto
        'text-secondary': '#6c757d',
        'bg-page': '#f8f9fa',
        'bg-card': '#ffffff',

        // Cores gray customizadas para corresponder às especificações
        gray: {
          50: '#f8f9fa',    // read-only input background
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',   // input border, outline button border
          400: '#9ca3af',   // placeholder, icon color
          500: '#6c757d',   // text-secondary
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.2', fontWeight: '900' }],
        'heading-1': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'heading-3': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
      }
    }
  },
  plugins: []
}
