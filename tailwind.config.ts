import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0e",
        sand: "#f2efe8",
        clay: "#c8b9a4",
        moss: "#189e7c",
        sun: "#ff8f49",
        ocean: "#2457f5"
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
