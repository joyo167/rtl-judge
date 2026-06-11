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
        background: "#18181b",
        surface: "#27272a",
        border: "#3f3f46",
        text: "#fafafa",
        muted: "#a1a1aa",
        accent: "#3b82f6",
        easy: "#22c55e",
        medium: "#f59e0b",
        hard: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
