/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        surface: '#ffffff',
        background: '#f8fafc',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}