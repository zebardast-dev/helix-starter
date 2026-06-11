import '../scss/app.scss'

// Auto-import scripts from all components and partials
import.meta.glob('../views/components/**/*.js', { eager: true })
import.meta.glob('../views/partials/**/*.js', { eager: true })
