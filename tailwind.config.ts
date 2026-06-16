import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        direct: {
          navy: '#071a2f',
          blue: '#0f67b1',
          cyan: '#36c2f3',
          ink: '#102235'
        }
      }
    }
  },
  plugins: []
};
export default config;
