import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { progressPlugin } from "./server/progressPlugin";
export default defineConfig({
  plugins: [react(), progressPlugin()],
  server: { fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.data/**", "**/*.sqlite*"] } },
});
