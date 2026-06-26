import chokidar from 'chokidar'
import { build } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { resolve, relative, dirname } from 'path'
import { fileURLToPath } from 'url'
import { sync as globSync } from 'glob'
import { spawn } from 'child_process'
import browserSync from 'browser-sync'

const __dirname = dirname(fileURLToPath(import.meta.url))

// WordPress dev URL — override with: DEV_URL=http://localhost/mysite npm run dev
const DEV_URL = process.env.DEV_URL || 'http://localhost/dev'

// ── ANSI ──────────────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
}

// ── Virtual: js-global ────────────────────────────────────────────────────────
const jsGlobalPlugin = {
  name: 'js-global',
  resolveId(id) { return id === 'virtual:js-global' ? '\0virtual:js-global' : null },
  load(id) {
    if (id !== '\0virtual:js-global') return null
    const index = resolve(__dirname, 'resources/js/global/index.js')
    const files = globSync('resources/js/global/**/*.js', { cwd: __dirname, absolute: true })
      .filter(f => f.replace(/\\/g, '/') !== index.replace(/\\/g, '/'))
      .sort()
    const entry = existsSync(index) ? [index] : files
    return entry.map(f => `import ${JSON.stringify(f.replace(/\\/g, '/'))}`).join('\n') || 'export {}'
  },
}

// ── Virtual: js-views ─────────────────────────────────────────────────────────
const jsViewsPlugin = {
  name: 'js-views',
  resolveId(id) { return id === 'virtual:js-views' ? '\0virtual:js-views' : null },
  load(id) {
    if (id !== '\0virtual:js-views') return null
    const files = globSync(
      ['resources/views/components/**/*.js', 'resources/views/partials/**/*.js'],
      { cwd: __dirname, absolute: true }
    )
    return files.map(f => `import ${JSON.stringify(f.replace(/\\/g, '/'))}`).join('\n') || 'export {}'
  },
}

// ── Virtual: app-js (CSS رو skip میکنه — جداگانه build میشه) ─────────────────
const appJsPlugin = {
  name: 'app-js-only',
  resolveId(id) { return id === 'virtual:app-js' ? '\0virtual:app-js' : null },
  load(id) {
    if (id !== '\0virtual:app-js') return null
    return [`import 'virtual:js-global'`, `import 'virtual:js-views'`].join('\n')
  },
}

// ── Output config ─────────────────────────────────────────────────────────────
const outputConfig = {
  entryFileNames: 'js/[name].js',
  chunkFileNames: 'js/chunks/[name].js',
  assetFileNames: (info) => {
    const name = info.name ?? ''
    if (name.endsWith('.css'))                          return 'css/[name][extname]'
    if (/\.(woff2?|ttf|otf|eot)$/.test(name))         return 'fonts/[name][extname]'
    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images/[name][extname]'
    return '[name][extname]'
  },
}

const BASE_BUILD = { outDir: 'public/dist', emptyOutDir: false, cssCodeSplit: true, minify: true }
const NO_CONFIG  = { configFile: false }

// ── CSS subprocess (هر build توی یه Node.js process جدید) ────────────────────
function spawnCssBuild(...args) {
  return new Promise((res, rej) => {
    const proc = spawn(process.execPath, [resolve(__dirname, 'scripts/build-css.mjs'), ...args], {
      cwd: __dirname, stdio: ['ignore', 'ignore', 'pipe'],
    })
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => code === 0 ? res() : rej(new Error(stderr.trim() || `build-css exited ${code}`)))
  })
}

// ── Loggers ───────────────────────────────────────────────────────────────────
function makeLogger(label) {
  return {
    name: 'watch-logger',
    writeBundle(_, bundle) {
      const files = Object.entries(bundle)
        .filter(([, ch]) => ch.type === 'asset' || (ch.type === 'chunk' && !!ch.code?.trim()))
        .map(([fileName, ch]) => ({ fileName, size: (ch.type === 'asset' ? ch.source : ch.code)?.length ?? 0 }))
      if (!files.length) return
      console.log(`\n${c.green}▲ rebuilt${c.reset}  ${c.dim}${label}  ${new Date().toLocaleTimeString()}${c.reset}`)
      for (const { fileName, size } of files)
        console.log(`  ${c.cyan}${fileName}${c.reset}  ${c.yellow}${(size / 1024).toFixed(1)} kB${c.reset}`)
    },
  }
}

function logFile(label, filePath) {
  const abs  = resolve(__dirname, 'public/dist', filePath)
  const size = existsSync(abs) ? (readFileSync(abs).length / 1024).toFixed(1) : '?'
  console.log(`\n${c.green}▲ rebuilt${c.reset}  ${c.dim}${label}  ${new Date().toLocaleTimeString()}${c.reset}`)
  console.log(`  ${c.cyan}${filePath}${c.reset}  ${c.yellow}${size} kB${c.reset}`)
}

// ── Build functions ───────────────────────────────────────────────────────────
async function buildAppJs(label) {
  await build({
    ...NO_CONFIG, logLevel: 'warn', publicDir: false,
    plugins: [appJsPlugin, jsGlobalPlugin, jsViewsPlugin, makeLogger(label)],
    build: { ...BASE_BUILD, rollupOptions: { input: { app: 'virtual:app-js' }, output: outputConfig } },
  })
}

async function buildAppCss(label) {
  await spawnCssBuild('app')
  logFile(label, 'css/app.css')
}

async function buildScssPage(name, label) {
  await spawnCssBuild('page', name)
  logFile(label, `css/pages/${name}.css`)
}

async function buildJsPage(name, label) {
  await build({
    ...NO_CONFIG, logLevel: 'warn', publicDir: false,
    plugins: [makeLogger(label)],
    build: {
      ...BASE_BUILD,
      rollupOptions: {
        input:  { [`pages/${name}`]: resolve(__dirname, `resources/js/pages/${name}.js`) },
        output: outputConfig,
      },
    },
  })
}

// ── Initial build ─────────────────────────────────────────────────────────────
async function buildAll() {
  const cssPages = globSync('resources/scss/pages/**/*.scss', { cwd: __dirname })
    .map(f => f.replace(/\\/g, '/').replace('resources/scss/pages/', '').replace('.scss', ''))

  const jsPageEntries = Object.fromEntries(
    globSync('resources/js/pages/**/*.js', { cwd: __dirname }).map(file => {
      const norm = file.replace(/\\/g, '/')
      const name = 'pages/' + norm.replace('resources/js/pages/', '').replace('.js', '')
      return [name, resolve(__dirname, norm)]
    })
  )

  // ── ۱. همه JS — dist رو پاک میکنه ─────────────────────────────────────────
  await build({
    ...NO_CONFIG, logLevel: 'warn', publicDir: false,
    plugins: [appJsPlugin, jsGlobalPlugin, jsViewsPlugin, makeLogger('initial build')],
    build: {
      ...BASE_BUILD,
      emptyOutDir: true,
      rollupOptions: { input: { app: 'virtual:app-js', ...jsPageEntries }, output: outputConfig },
    },
  })

  // ── ۲. همه CSS — parallel subprocesses (همه با هم) ─────────────────────────
  await Promise.all([
    spawnCssBuild('app').then(() => logFile('initial build', 'css/app.css')),
    ...cssPages.map(name =>
      spawnCssBuild('page', name).then(() => logFile('initial build', `css/pages/${name}.css`))
    ),
  ])
}

// ── File → target ─────────────────────────────────────────────────────────────
function resolveTarget(file) {
  const rel = file.replace(/\\/g, '/')
  const scssPage = rel.match(/resources\/scss\/pages\/(.+)\.scss$/)
  if (scssPage) return { type: 'scss-page', name: scssPage[1] }
  const jsPage = rel.match(/resources\/js\/pages\/(.+)\.js$/)
  if (jsPage) return { type: 'js-page', name: jsPage[1] }
  if (rel.endsWith('.js')) return { type: 'app-js' }
  // blade تغییر → HTML عوض شده، full reload لازمه
  // scss تغییر → فقط CSS inject کافیه
  return { type: 'app-css', fullReload: rel.endsWith('.blade.php') }
}

// ── Queue ─────────────────────────────────────────────────────────────────────
let isBuilding    = false
let queued        = null
let debounceTimer = null

async function dispatch(target, label, bs) {
  if (isBuilding) { queued = { target, label }; return }
  isBuilding = true
  try {
    if (target.type === 'app-js')    { await buildAppJs(label);                bs.reload() }
    if (target.type === 'app-css')   { await buildAppCss(label);               target.fullReload ? bs.reload() : bs.reload('*.css') }
    if (target.type === 'scss-page') { await buildScssPage(target.name, label); bs.reload('*.css') }
    if (target.type === 'js-page')   { await buildJsPage(target.name, label);   bs.reload() }
  } catch (err) {
    console.error(`\n${c.red}✖ error${c.reset}  ${err.message}`)
  } finally {
    isBuilding = false
    if (queued) { const q = queued; queued = null; dispatch(q.target, q.label, bs) }
  }
}

function onChange(file, bs) {
  const rel    = relative(__dirname, file).replace(/\\/g, '/')
  const target = resolveTarget(file)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    console.log(`${c.dim}~ ${rel} → ${target.type}${target.name ? ':' + target.name : ''}${c.reset}`)
    dispatch(target, rel, bs)
  }, 150)
}

// ── Start ─────────────────────────────────────────────────────────────────────
console.log(`\n${c.bold}helix${c.reset}  ${c.dim}building…${c.reset}`)

buildAll().then(() => {
  const bs = browserSync.create()
  bs.init({ proxy: DEV_URL, open: true, notify: false, logLevel: 'silent' }, () => {
    const port   = bs.getOption('port')
    const bsUrl  = DEV_URL.replace(/^https?:\/\/[^/]+/, `http://localhost:${port}`)
    console.log(`${c.cyan}browser-sync${c.reset}  ${c.bold}${bsUrl}${c.reset}  ${c.dim}(proxy: ${DEV_URL})${c.reset}`)
  })

  chokidar.watch(['resources/js', 'resources/scss', 'resources/views'], {
    cwd:           __dirname,
    ignoreInitial: true,
    ignored: (f) => f.includes('node_modules') || f.includes('._helix_build') || (f.endsWith('.php') && !f.endsWith('.blade.php')),
  })
    .on('change', rel => onChange(resolve(__dirname, rel), bs))
    .on('add',    rel => onChange(resolve(__dirname, rel), bs))
    .on('ready',  ()  => console.log(`${c.dim}watching resources…${c.reset}\n`))
}).catch(err => {
  console.error(err.message)
  process.exit(1)
})
