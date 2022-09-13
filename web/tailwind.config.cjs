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
        "primary": "#1053AB",
        "secondary": "#102D47",
        "accent": "#1053AB",
        "neutral": "#121212",
        "base-100": "#FFFFFF",
        "info": "#1053AB",
        "success": "#368632",
        "warning": "#FBBD23",
        "error": "#DC3545",
      }
    }],
  }
}
