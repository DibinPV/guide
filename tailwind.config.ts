import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0e",
        sand: "#f2efe8",
        clay: "#c8b9a4",
        moss: "#2a5b4b",
        sun: "#f0b429"
      },
      fontFamily: {
        display: ["\"Fraunces\"", "serif"],
        body: ["\"Source Sans 3\"", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
