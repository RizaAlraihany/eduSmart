import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@' → src/
      // Setelah ini: import Button from '@/shared/components/ui/Button'
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
