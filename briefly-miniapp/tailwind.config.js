/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 16px 40px rgba(0,0,0,0.28)",
      },
    },
  },
  plugins: [],
};
