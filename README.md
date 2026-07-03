# Helix Starter

A ready-to-use starter theme built on HelixPress.

## Requirements

- PHP 8.1+
- WordPress 5.9+
- Composer
- Node.js 18+

## Installation

```bash
# Clone into your WordPress themes directory
git clone https://github.com/zebardast-dev/helix-starter.git wp-content/themes/my-theme

cd wp-content/themes/my-theme

# Install PHP dependencies
composer install

# Install JS dependencies and build assets
npm install && npm run build
```

Activate the theme from WordPress admin, then copy `.env.example` to `.env` and configure.

## Local Development (with framework symlink)

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
```

## Credits

HelixPress was developed through a human-AI collaborative workflow.

- **Architecture & Product Direction:** Mostafa Zebardast
- **Research & Technical Analysis:** ChatGPT & Claude
- **Implementation & Coding:** Mostafa Zebardast & Claude (Anthropic)
- **Review & Refinement:** AI-assisted

*This project reflects human-led design decisions, with AI utilized as a development partner for drafting, research, and implementation.*

## License

MIT
