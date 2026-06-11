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

// Auto-discover standalone SCSS page entries from resources/scss/pages/
// Maps each .scss file to a virtual JS module that only imports it,
// so Vite processes it through PostCSS/Tailwind and outputs a separate CSS file.
const scssPageMap = new Map(
  globSync('resources/scss/pages/**/*.scss', { cwd: __dirname }).map(file => {
    const normalized = file.replace(/\\/g, '/')
    const name = normalized.replace('resources/scss/pages/', '').replace('.scss', '')
    const id = 'virtual:scss-page/' + name
    const abs = resolve(__dirname, normalized).replace(/\\/g, '/')
    return [id, { name, abs }]
  })
)

const scssPagePlugin = {
  name: 'scss-page-entries',
  resolveId(id) {
    return scssPageMap.has(id) ? '\0' + id : null
  },
  load(id) {
    if (!id.startsWith('\0virtual:scss-page/')) return null
    const { abs } = scssPageMap.get(id.slice(1))
    return `import ${JSON.stringify(abs)}`
  },
  generateBundle(_, bundle) {
    // Remove the empty JS stubs — only the CSS output is needed
    for (const [file, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk' && chunk.facadeModuleId?.includes('virtual:scss-page/') && !chunk.code.trim()) {
        delete bundle[file]
      }
    }
  },
}

const scssPageEntries = Object.fromEntries(
  [...scssPageMap.entries()].map(([id, { name }]) => [name, id])
)

export default defineConfig({
  plugins: [scssPagePlugin],

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        importers: [sassGlobImporter],
        silenceDeprecations: ['import'],
        additionalData(content, filepath) {
          // Page SCSS files are standalone bundles (no @import "tailwindcss"),
          // so @reference lets @apply resolve utilities without duplicating Tailwind output.
          if (filepath.replace(/\\/g, '/').includes('/scss/pages/')) {
            return `@reference "tailwindcss";\n${content}`
          }
          return content
        },
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
        ...scssPageEntries,
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
