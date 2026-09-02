/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        'primary-hover': '#34d399',
        'primary-soft': '#f0fdf7',
        'primary-border': '#a7f3d0',
        info: '#2563eb',
        'info-soft': '#eff6ff',
        'info-border': '#bfdbfe',
        warning: '#f59e0b',
        'warning-soft': '#fef3c7',
        'warning-border': '#fde68a',
        danger: '#ef4444',
        'danger-soft': '#fee2e2',
        'danger-border': '#fecaca',
        neutral: '#475569',
        'shell-bg': '#f2f4f6',
        'surface-muted': '#fafbfc',
        border: '#e9edf2',
        'border-strong': '#dde3ea',
        'text-main': '#334155',
        'muted-foreground': '#64748b',
        'text-tertiary': '#94a3b8',
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
      },
    },
  },
  plugins: [],
};
