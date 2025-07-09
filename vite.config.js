import {defineConfig} from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
// import tailwindcss from "tailwindcss"

// https://vite.dev/config/
export default defineConfig({
 plugins: [react(), tailwindcss()],
 server: {
  proxy: {
   "/api": {
    target: process.env.VITE_BASE_URL,
    secure: false
   }
  }
 }
})
