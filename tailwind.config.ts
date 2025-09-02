import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        'walden-pond': '#759ab7',
        'burnt-sienna': '#ce6e55',
        'squid-ink': '#04132a',
        
        // Variants for better UX
        primary: {
          50: '#f0f4f7',
          100: '#dae6ec',
          200: '#b8ceda',
          300: '#91b0c1',
          400: '#759ab7', // walden-pond
          500: '#5d7d9b',
          600: '#4a647c',
          700: '#3d5266',
          800: '#344556',
          900: '#2e3c49',
        },
        accent: {
          50: '#fdf4f2',
          100: '#fce7e3',
          200: '#f9d2cc',
          300: '#f4b3a8',
          400: '#ec8a75',
          500: '#ce6e55', // burnt-sienna
          600: '#b85a44',
          700: '#9a4937',
          800: '#7f3e32',
          900: '#6a372f',
        },
        dark: {
          50: '#f6f7f9',
          100: '#ebeef2',
          200: '#d3dae2',
          300: '#adbcc9',
          400: '#8096ab',
          500: '#617791',
          600: '#4e5f79',
          700: '#414e62',
          800: '#394252',
          900: '#323847',
          950: '#04132a', // squid-ink
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
