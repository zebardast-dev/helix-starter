import '../css/tailwind.css'
import '../scss/app.scss'

// Auto-import styles from all components and partials
// Files are picked up automatically — no manual registration needed
import.meta.glob('../views/components/**/*.scss', { eager: true })
import.meta.glob('../views/partials/**/*.scss', { eager: true })

// Auto-import scripts from all components and partials
import.meta.glob('../views/components/**/*.js', { eager: true })
import.meta.glob('../views/partials/**/*.js', { eager: true })
