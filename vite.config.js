import { defineConfig } from 'vite'
import { sync as globSync } from 'glob'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Custom SASS importer: expands glob patterns like @import '../views/**/*.scss'
const sassGlobImporter = {
  canonicalize(url, { containingUrl }) {
    if (!url.includes('*')) return null
    const dir = dirname(fileURLToPath(containingUrl))
    const abs = resolve(dir, url).replace(/\\/g, '/')
    return new URL('sass-glob:/' + encodeURIComponent(abs))
  },
  load(canonicalUrl) {
    if (!canonicalUrl.href.startsWith('sass-glob:')) return null
    const pattern = decodeURIComponent(canonicalUrl.pathname.slice(1))
    const files = globSync(pattern)
    if (files.length === 0) return { contents: '', syntax: 'scss' }
    const contents = files.map(f => readFileSync(f, 'utf-8')).join('\n\n')
    return { contents, syntax: 'scss' }
  },
}

// Auto-discover page-specific JS entries from resources/js/pages/
const pageEntries = Object.fromEntries(
  globSync('resources/js/pages/**/*.js', { cwd: __dirname }).map(file => {
    const name = file.replace('resources/js/pages/', '').replace('.js', '')
    return [name, resolve(__dirname, file)]
  })
)

export default defineConfig({
  plugins: [],

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        importers: [sassGlobImporter],
        silenceDeprecations: ['import'],
      },
    },
  },

  build: {
    outDir: 'resources/assets/dist',
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
