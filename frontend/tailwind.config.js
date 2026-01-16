/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-orange': '#ff6b35',
        'neon-cyan': '#00e5cc',
        'neon-pink': '#ff2e88',
        'dark-bg': '#0a0a0f',
        'dark-card': '#12121a',
        'dark-border': '#1e1e2e',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 229, 204, 0.3)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 229, 204, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 229, 204, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
