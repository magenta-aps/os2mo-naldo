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
        primary: "#1053AB",
        secondary: "#00244E",
        accent: "#D1E4FF", // Also know as tertiary
        neutral: "#121212",
        "base-100": "#FFFFFF",

        // Neutral - Doesn't overwrite, just for reference
        "slate-100": "#F8FAFC",
        "slate-300": "#CBD5E1",
        "slate-600": "#475569",

        // Text
        "primary-text": "#00244E",
        "secondary-text": "#475569",
        "tertiary-text": "#CBD5E1",

        // Accent
        error: "#DC3545",
        success: "#368632",
        info: "#1053AB",
        warning: "#FBBD23",
      }
    }],
  }
}
