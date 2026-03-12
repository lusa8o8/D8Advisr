import type { Config } from "tailwindcss";

const config: Config = {
  content: ["src/**/*.{ts,tsx,mdx}", "components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#FF5A5F",
        "brand-dark": "#E54E53",
        success: "#00C851",
        warning: "#FF9500",
        background: "#F7F7F7",
        "text-primary": "#222222",
        "text-secondary": "#555555",
      },
    },
  },
  plugins: [],
};

export default config;
