/**
 * Standalone CSS build script — runs in a fresh Node.js process so Tailwind
 * has no cached state from previous builds. Called by watch.js via spawn().
 *
 * Usage:
 *   node scripts/build-css.mjs app
 *   node scripts/build-css.mjs page about
 */

import { build } from 'vite'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { sync as globSync } from 'glob'
import tailwindcss from '@tailwindcss/postcss'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

const [, , target, name] = process.argv

// ── CSS config ────────────────────────────────────────────────────────────────
// additionalData pre-expands @import glob patterns in Node.js (fresh readFileSync
// each build call) before SASS ever sees them — no SASS importer / daemon cache
// can interfere, because SASS only receives plain SCSS without glob syntax.
const scssDir = resolve(ROOT, 'resources/scss')

function expandGlobs(content) {
  return content.replace(
    /@import\s+['"]([^'"]*\*[^'"]*)['"]\s*;?/g,
    (_match, pattern) => {
      const abs = resolve(scssDir, pattern).replace(/\\/g, '/')
      const files = globSync(abs)
      if (files.length === 0) return '/* (no files matched) */'
      return files.map(f => readFileSync(f, 'utf-8')).join('\n\n')
    }
  )
}

const cssConfig = {
  postcss: { plugins: [tailwindcss()] },
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler',
      silenceDeprecations: ['import'],
      additionalData(content, filepath) {
        if (filepath.replace(/\\/g, '/').includes('/scss/pages/')) {
          return `@reference "tailwindcss";\n${content}`
        }
        return content
      },
    },
  },
}

const outputConfig = {
  entryFileNames: 'js/[name].js',
  chunkFileNames: 'js/chunks/[name].js',
  assetFileNames: (info) => {
    const n = info.name ?? ''
    if (n.endsWith('.css'))                          return 'css/[name][extname]'
    if (/\.(woff2?|ttf|otf|eot)$/.test(n))         return 'fonts/[name][extname]'
    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(n)) return 'images/[name][extname]'
    return '[name][extname]'
  },
}

const BASE = {
  configFile: false,
  logLevel:   'warn',
  publicDir:  false,
  build: {
    outDir:       'public/dist',
    emptyOutDir:  false,
    cssCodeSplit: true,
    minify:       true,
  },
}

// ── app CSS ───────────────────────────────────────────────────────────────────
async function buildAppCss() {
  const prev = resolve(ROOT, 'public/dist/css/app.css')
  if (existsSync(prev)) unlinkSync(prev)

  // Expand glob @imports in Node.js and write to a sibling temp file.
  // Placing it inside resources/scss/ means @use 'base/...' still resolves
  // correctly. SASS never sees any glob syntax — no daemon cache possible.
  const appScssPath = resolve(ROOT, 'resources/scss/app.scss')
  const tmpFile     = resolve(ROOT, 'resources/scss/._helix_build.scss')
  writeFileSync(tmpFile, expandGlobs(readFileSync(appScssPath, 'utf-8')))

  const plugin = {
    name: 'app-css-entry',
    resolveId(id) { return id === 'virtual:app-css' ? '\0virtual:app-css' : null },
    load(id) {
      if (id !== '\0virtual:app-css') return null
      return `import ${JSON.stringify(tmpFile.replace(/\\/g, '/'))}`
    },
    generateBundle(_, bundle) {
      for (const [file, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && !chunk.code?.trim()) delete bundle[file]
      }
    },
  }

  try {
    await build({
      ...BASE,
      plugins: [plugin],
      css:     cssConfig,
      build: {
        ...BASE.build,
        rollupOptions: {
          input:  { app: 'virtual:app-css' },
          output: outputConfig,
        },
      },
    })
  } finally {
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  }
}

// ── page CSS ──────────────────────────────────────────────────────────────────
async function buildPageCss(pageName) {
  const prev = resolve(ROOT, `public/dist/css/pages/${pageName}.css`)
  if (existsSync(prev)) unlinkSync(prev)

  const abs = resolve(ROOT, `resources/scss/pages/${pageName}.scss`)

  const plugin = {
    name: 'page-css-entry',
    resolveId(id) { return id === 'virtual:target' ? '\0virtual:target' : null },
    load(id) { return id === '\0virtual:target' ? `import ${JSON.stringify(abs)}` : null },
    generateBundle(_, bundle) {
      for (const [file, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && !chunk.code?.trim()) { delete bundle[file]; continue }
        const m = file.match(/^css\/(.+)\.css$/)
        if (chunk.type === 'asset' && m) {
          const out = `css/pages/${pageName}.css`
          bundle[out] = { ...chunk, fileName: out }
          delete bundle[file]
        }
      }
    },
  }

  await build({
    ...BASE,
    plugins: [plugin],
    css:     cssConfig,
    build: {
      ...BASE.build,
      rollupOptions: {
        input:  { [pageName]: 'virtual:target' },
        output: outputConfig,
      },
    },
  })
}

// ── run ───────────────────────────────────────────────────────────────────────
try {
  if (target === 'app')  await buildAppCss()
  if (target === 'page') await buildPageCss(name)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
