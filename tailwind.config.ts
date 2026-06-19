import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#f8f9fa",
        border: "#dee2e6",
        text: "#1a1a1a",
        muted: "#6c757d",
        accent: "#1a5fb4",
        easy: "#2f9e44",
        medium: "#f08c00",
        hard: "#e03131",
      },
    },
  },
  plugins: [],
};
export default config;
