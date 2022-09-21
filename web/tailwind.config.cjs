/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      textUnderlineOffset: {
        5: '5px'
      }

    },
    fontSize: {
      // TEXT ---- 1rem = 16px
      'base': ['1rem', { lineHeight: '1.5rem' }], // "base": 16px/1rem --- lineheight: 24px/1.5rem = 16px*1.5)
      'lg': ['1.125rem', { lineHeight: '1.688rem' }], // "lg":   18px/1rem --- lineheight: 27px/1.688rem = 18px*1.5)
      'xl': ['1.25rem', { lineHeight: '1.875rem' }], // "xl":   20px/1rem --- lineheight: 30px/1.875rem = 20px*1.5)
      '2xl': ['1.375rem', { lineHeight: '2.063rem' }], // "2xl":  22px/1rem --- lineheight: 33px/2.063rem = 22px*1.5)
      '3xl': ['1.5rem', { lineHeight: '2.25rem' }], // "3xl":  24px/1rem --- lineheight: 36px/2.25rem = 24px*1.5)

      // HEADINGS ---- 1rem = 16px
      'heading-1': ['1.5rem', { lineHeight: '2.063rem' }], // "heading-1": 24px/1rem --- lineheight: 33px/1.5rem = 24px*1.5)
      'heading-2': ['1.375rem', { lineHeight: '1.875rem' }], // "heading-2": 22px/1rem --- lineheight: 30px/1.5rem = 22px*1.5)
      'heading-3': ['1.25rem', { lineHeight: '1.75rem' }], // "heading-3": 20px/1rem --- lineheight: 28px/1.5rem = 20px*1.5)
      'heading-4': ['1.125rem', { lineHeight: '1.5rem' }], // "heading-4": 18px/1rem --- lineheight: 24px/1.5rem = 18px*1.5)
    },
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
      },

    }],
  }
}
