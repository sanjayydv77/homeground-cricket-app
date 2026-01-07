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
        primary: {
          DEFAULT: "#059669", // Emerald 600
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1e293b", // Slate 800
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#ef4444", // Red 500
          foreground: "#FFFFFF",
        },
        background: "#f8fafc", // Slate 50
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        // Placeholder for cricket background - using a subtle pattern/gradient for now
        "cricket-pattern": "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2605&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", 
      },
    },
  },
  plugins: [],
};
export default config;
