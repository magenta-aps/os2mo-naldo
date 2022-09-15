/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [{
      magenta: {
        // Primary
        "primary": "#1053AB",
        "secondary": "#00244E",
        "tertiary": "#D1E4FF",
        "accent": "#D1E4FF",
        "neutral": "#121212",
        "base-100": "#FFFFFF",

        // Neutral
        "light-100": "#F8FAFC",
        "light-300": "#CBD5E1",
        "light-600": "#475569",

        // Text
        "primary-text": "#00244E",
        "secondary-text": "#475569",
        "tertiary-text": "#CBD5E1",

        // Accent
        "error": "#DC3545",
        "success": "#368632",
        "info": "#1053AB",
        "warning": "#FBBD23",
      }
    }],
  }
}
