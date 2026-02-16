import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // command가 'build'이면 true, 'serve'(개발)이면 false
  const isBuild = command === "build";

  return {
    plugins: [react()],
    base: isBuild ? "/select4/" : "/",
  };
});
