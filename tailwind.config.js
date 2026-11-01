/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy navy palette kept for zero-breakage during transition
        navy: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0F172A',
          800: '#1E293B',
          750: '#283548',
          700: '#334155',
        },
        brand: {
          teal: '#14B8A6',
          tealDark: '#0F766E',
          tealLight: '#2DD4BF',
          tealSoft: 'rgba(20, 184, 166, 0.1)',
        },

        // ── Cream & Mocha palette ───────────────────────────────────────
        cream: {
          50:  '#FFFDF8', // card / panel surfaces
          100: '#F6F0E7', // main page background
          200: '#EFE6D6', // secondary surface mid-tone
          300: '#E6D8C5', // secondary surfaces / panel backgrounds
          400: '#D8C6B2', // borders & dividers
          500: '#CBAF96', // stronger border accent
          600: '#EADCCB', // hover states on surfaces
        },
        mocha: {
          50:  '#F5EDE7', // very light tint
          100: '#E8D5CA', // light surface tint
          200: '#C9A98E', // mid mocha
          300: '#9B7260', // medium mocha
          400: '#78685B', // secondary text
          500: '#76513C', // primary accent / CTA
          600: '#5D3D2D', // button hover
          700: '#4A2E20', // deep mocha
          800: '#38271F', // headings / primary text
          900: '#2A1B14', // darkest mocha
        },
        indicator: {
          income:  '#287A55', // positive / income green
          expense: '#B94C48', // expense / negative red
          warning: '#B77925', // budget warning amber
          info:    '#567A91', // informational blue-grey
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
