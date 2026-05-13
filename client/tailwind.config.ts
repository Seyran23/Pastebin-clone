import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        xl: '1340px',
      },
    },
    extend: {
      colors: {
        borderCustom: 'neutral-600',
        backgroundLight: '#f8f9fa',
      },
    },
  },
  plugins: [],
};

export default config;
