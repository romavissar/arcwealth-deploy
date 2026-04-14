import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--indigo-fill)", foreground: "var(--indigo-text)" },
        accent: "var(--amber-fill)",
        success: "var(--emerald-fill)",
        danger: "var(--red-fill)",
        "aw-bg-page": "var(--bg-page)",
        "aw-bg-card": "var(--bg-card)",
        "aw-text": "var(--text-primary)",
        "aw-muted": "var(--text-muted)",
        "aw-border": "var(--border)",
        "aw-amber": "var(--amber-fill)",
        "aw-amber-text": "var(--amber-text)",
        "aw-emerald": "var(--emerald-fill)",
        "aw-emerald-text": "var(--emerald-text)",
        "aw-red": "var(--red-fill)",
        "aw-red-text": "var(--red-text)",
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
