import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { sync as globSync } from 'glob'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Auto-discover page-specific JS entries from resources/js/pages/
const pageEntries = Object.fromEntries(
  globSync('resources/js/pages/**/*.js', { cwd: __dirname }).map(file => {
    const name = file.replace('resources/js/pages/', '').replace('.js', '')
    return [name, resolve(__dirname, file)]
  })
)

export default defineConfig({
  plugins: [tailwindcss()],

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        app: resolve(__dirname, 'resources/js/app.js'),
        ...pageEntries,
      },

      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/chunks/[name].js',
        assetFileNames: (info) => {
          const name = info.name ?? ''
          if (name.endsWith('.css'))                          return 'css/[name][extname]'
          if (/\.(woff2?|ttf|otf|eot)$/.test(name))         return 'fonts/[name][extname]'
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images/[name][extname]'
          return '[name][extname]'
        },
      },
    },

    cssCodeSplit: true,
    minify: true,
  },
})
