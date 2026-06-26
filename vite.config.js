import { defineConfig } from 'vite'
import { sync as globSync } from 'glob'
import { readFileSync, existsSync } from 'fs'
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

// Virtual module: imports all JS files from resources/js/global/.
// Using load() hook instead of import.meta.glob so new files are detected
// without restarting watch mode — addWatchFile(dir) causes re-evaluation
// when the directory changes (file added/removed).
const jsGlobalPlugin = {
  name: 'js-global',
  resolveId(id) {
    if (id === 'virtual:js-global') return '\0virtual:js-global'
    return null
  },
  load(id) {
    if (id !== '\0virtual:js-global') return null
    this.addWatchFile(resolve(__dirname, 'resources/js/global'))
    const index = resolve(__dirname, 'resources/js/global/index.js')
    const files = globSync('resources/js/global/**/*.js', { cwd: __dirname, absolute: true })
      .filter(f => f.replace(/\\/g, '/') !== index.replace(/\\/g, '/'))
      .sort()
    const entry = existsSync(index) ? [index] : files
    return entry.map(f => `import ${JSON.stringify(f.replace(/\\/g, '/'))}`).join('\n') || 'export {}'
  },
}

// Virtual module: imports all JS files from views components and partials.
// Same pattern as jsGlobalPlugin — directory-level watch ensures new files
// trigger a rebuild without restart.
const jsViewsPlugin = {
  name: 'js-views',
  resolveId(id) {
    if (id === 'virtual:js-views') return '\0virtual:js-views'
    return null
  },
  load(id) {
    if (id !== '\0virtual:js-views') return null
    this.addWatchFile(resolve(__dirname, 'resources/views/components'))
    this.addWatchFile(resolve(__dirname, 'resources/views/partials'))
    const files = globSync(
      ['resources/views/components/**/*.js', 'resources/views/partials/**/*.js'],
      { cwd: __dirname, absolute: true }
    )
    return files.map(f => `import ${JSON.stringify(f.replace(/\\/g, '/'))}`).join('\n') || 'export {}'
  },
}

// Watches SCSS files inside views so changes trigger a rebuild.
// The SASS glob importer inlines content as a string, so Vite doesn't track
// individual component files as dependencies.
const scssViewsWatcher = {
  name: 'scss-views-watcher',
  buildStart() {
    this.addWatchFile(resolve(__dirname, 'resources/views/components'))
    this.addWatchFile(resolve(__dirname, 'resources/views/partials'))
    const files = globSync(
      ['resources/views/components/**/*.scss', 'resources/views/partials/**/*.scss'],
      { cwd: __dirname, absolute: true }
    )
    for (const file of files) this.addWatchFile(file)
  },
}

// Discovers SCSS page entries dynamically on every build so new files are
// picked up without restarting watch mode.
let scssPageMap = new Map()

const scssPagePlugin = {
  name: 'scss-page-entries',
  options(opts) {
    scssPageMap = new Map(
      globSync('resources/scss/pages/**/*.scss', { cwd: __dirname }).map(file => {
        const normalized = file.replace(/\\/g, '/')
        const name = normalized.replace('resources/scss/pages/', '').replace('.scss', '')
        const id = 'virtual:scss-page/' + name
        const abs = resolve(__dirname, normalized)
        return [id, { name, abs }]
      })
    )
    const entries = Object.fromEntries(
      [...scssPageMap.entries()].map(([id, { name }]) => [name, id])
    )
    opts.input = { ...opts.input, ...entries }
    return opts
  },
  buildStart() {
    this.addWatchFile(resolve(__dirname, 'resources/scss/pages'))
  },
  resolveId(id) {
    return scssPageMap.has(id) ? '\0' + id : null
  },
  load(id) {
    if (!id.startsWith('\0virtual:scss-page/')) return null
    const { abs } = scssPageMap.get(id.slice(1))
    return `import ${JSON.stringify(abs)}`
  },
  generateBundle(_, bundle) {
    const pageNames = new Set([...scssPageMap.values()].map(({ name }) => name))

    for (const [file, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk' && chunk.facadeModuleId?.includes('virtual:scss-page/') && !chunk.code.trim()) {
        delete bundle[file]
        continue
      }

      const cssMatch = file.match(/^css\/(.+)\.css$/)
      if (chunk.type === 'asset' && cssMatch && pageNames.has(cssMatch[1])) {
        const newFile = `css/pages/${cssMatch[1]}.css`
        bundle[newFile] = { ...chunk, fileName: newFile }
        delete bundle[file]
      }
    }
  },
}

// Discovers JS page entries dynamically on every build so new files are
// picked up without restarting watch mode.
// Output: dist/js/pages/about.js (mirrors SCSS pages structure)
const jsPagePlugin = {
  name: 'js-page-entries',
  options(opts) {
    const entries = Object.fromEntries(
      globSync('resources/js/pages/**/*.js', { cwd: __dirname }).map(file => {
        const normalized = file.replace(/\\/g, '/')
        const name = 'pages/' + normalized.replace('resources/js/pages/', '').replace('.js', '')
        return [name, resolve(__dirname, normalized)]
      })
    )
    opts.input = { ...opts.input, ...entries }
    return opts
  },
  buildStart() {
    this.addWatchFile(resolve(__dirname, 'resources/js/pages'))
  },
}

export default defineConfig({
  plugins: [jsGlobalPlugin, jsViewsPlugin, scssViewsWatcher, scssPagePlugin, jsPagePlugin],

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        importers: [sassGlobImporter],
        silenceDeprecations: ['import'],
        additionalData(content, filepath) {
          if (filepath.replace(/\\/g, '/').includes('/scss/pages/')) {
            return `@reference "tailwindcss";\n${content}`
          }
          return content
        },
      },
    },
  },

  publicDir: false,

  build: {
    outDir: 'public/dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        app: resolve(__dirname, 'resources/js/app.js'),
        // page JS and SCSS entries are injected dynamically by jsPagePlugin and scssPagePlugin
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
