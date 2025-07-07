import type { Config } from "tailwindcss";
import lineClamp from "@tailwindcss/line-clamp"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [lineClamp],
};
export default config;
