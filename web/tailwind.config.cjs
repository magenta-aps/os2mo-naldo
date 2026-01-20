/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      textUnderlineOffset: {
        5: '5px'
      }
    },
  },
}
