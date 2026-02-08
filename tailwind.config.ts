// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // AQUI ESTÁ O SEGREDO: Verifique se "./src" está no início de todas as linhas
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1a202c", foreground: "#ffffff" },
        accent: { DEFAULT: "#c5a47e", hover: "#b08d66" },
        medical: "#2d6a4f",
        soft: "#f9fafb",
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;