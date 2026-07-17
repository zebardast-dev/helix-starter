# Helix Starter

`zebardast-dev/helix-starter`

A production-ready starter theme built on HelixPress Framework.

## Requirements

- PHP 8.1+
- WordPress 6.0+
- Node.js & npm (for asset compilation)
- Composer

## Quick Start

### 1) Install via Composer

```bash
cd wp-content/themes
composer create-project zebardast-dev/helix-starter my-theme
cd my-theme
```

### 2) Setup environment

```bash
cp .env.example .env
```

### 3) Build assets

```bash
# Production build
npm install && npm run build

# Dev mode with live reload
npm run dev
```

Activate the theme from WordPress admin.

## Local Development (with framework symlink)

To work on the framework and starter simultaneously, symlink the local framework:

```bash
composer config repositories.helix-framework \
  '{"type":"path","url":"../helix-framework","options":{"symlink":true}}'

git update-index --assume-unchanged composer.json

composer install
```

## CLI

```bash
php helix list
php helix cache:clear
php helix make:component Alert
php helix make:composer Home
php helix db:seed
```

## Documentation

Welcome to the HelixPress documentation.

The full documentation is currently being prepared. In the meantime, you can use the official docs portal below to explore the available guides and topics.

**Official Documentation:**  
[https://helix.runflare.run/](https://helix.runflare.run/)

### Topics coming soon

- Getting Started
- Configuration
- Blade Templates
- Components
- View Composers
- Models and Queries
- Assets
- Custom Post Types
- CLI and Seeders
- Inspector
- WooCommerce
- Actions and Filters
- File Uploads

## Credits

HelixPress was developed through a human-AI collaborative workflow.

- **Architecture & Product Direction:** Mostafa Zebardast
- **Idea & Research:** Mostafa Zebardast ([@zebardast-dev](https://github.com/zebardast-dev)), Amirhossein Zebardast ([@amirz-dev](https://github.com/amirz-dev))
- **Implementation & Coding:** Mostafa Zebardast & Claude (Anthropic)
- **Review & Refinement:** AI-assisted

*This project reflects human-led design decisions, with AI utilized as a development partner for drafting, research, and implementation.*

## License

MIT
