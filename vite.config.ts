import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// viteSingleFile inlines JS, CSS, fonts and photos so dist/index.html is one shareable file
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
