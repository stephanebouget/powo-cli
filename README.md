# 🌐 powo-cli

[![npm version](https://badge.fury.io/js/powo-cli.svg)](https://badge.fury.io/js/powo-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**powo-cli** is a powerful Node.js module designed to seamlessly import Powo translations into your web projects. Streamline your internationalization workflow with support for multiple platforms and flexible translation management.

## ✨ Features

- Multi-language support with automatic file generation
- Flexible configuration options for different project types
- Cross-platform support (Android, iOS, Web, Robot)
- Support for both global and feature-based translation loading
- Version management (latest approved or draft translations)
- Proxy support for enterprise environments

## 📦 Installation

### Using Yarn (Recommended)

```bash
yarn add powo-cli
```

### Using npm

```bash
npm install powo-cli
```

## 🚀 Quick Start

Add the powo script to your `package.json`:

```json
{
  "scripts": {
    "powo": "load-locales --project=MyPowoProject --country=XX --platform=web --version=last --languages=fr,en --location=src/locales/"
  }
}
```

Then run:

```bash
npm run powo
# or
yarn powo
```

## 📖 Usage

### 🌍 Global Translation Files

Load all translations into consolidated language files:

```json
{
  "scripts": {
    "powo:global": "load-locales --project=MyPowoProject --country=XX --platform=web --version=last --languages=fr,en --location=src/locales/"
  }
}
```

This command generates `en.json` and `fr.json` files with all approved translations in your specified location.

#### 🔧 Global Mode Options

| Option      | Description                                        | Required | Default |
| ----------- | -------------------------------------------------- | -------- | ------- |
| `project`   | Powo Project's name                                | ✅       | -       |
| `country`   | Country code                                       | ❌       | `XX`    |
| `platform`  | Target platform (`Android`, `iOS`, `web`, `robot`) | ✅       | -       |
| `version`   | Translation version (`last` or `draft`)            | ✅       | -       |
| `languages` | Comma-separated list of languages to generate      | ✅       | -       |
| `location`  | Destination folder path                            | ✅       | -       |
| `proxy`     | Proxy URL (format: `http://proxy.fr:8080`)         | ❌       | -       |

### 🎯 Feature-Based Translation Files

Load translations organized by features for better modularity:

```json
{
  "scripts": {
    "powo:features": "load-by-features --project=MyPowoProject --country=XX --platform=web --version=last --location=src/locales/"
  }
}
```

This command generates separate JSON files for each feature, enabling more granular translation management.

#### 🔧 Feature Mode Options

| Option     | Description                                        | Required | Default |
| ---------- | -------------------------------------------------- | -------- | ------- |
| `project`  | Powo Project's name                                | ✅       | -       |
| `country`  | Country code                                       | ❌       | `XX`    |
| `platform` | Target platform (`Android`, `iOS`, `web`, `robot`) | ✅       | -       |
| `version`  | Translation version (`last` or `draft`)            | ✅       | -       |
| `location` | Destination folder path                            | ✅       | -       |
| `proxy`    | Proxy URL (format: `http://proxy.fr:8080`)         | ❌       | -       |

## 💡 Examples

### Basic Web Project

```bash
# Load French and English translations for a web project
load-locales --project=MyWebApp --platform=web --version=last --languages=fr,en --location=src/i18n/
```

### Mobile App with Proxy

```bash
# Load translations for iOS app through corporate proxy
load-locales --project=MyMobileApp --platform=iOS --version=draft --languages=en,es,de --location=assets/translations/ --proxy=http://corporate-proxy:8080
```

### Feature-Based Organization

```bash
# Generate feature-specific translation files
load-by-features --project=MyLargeApp --platform=web --version=last --location=src/locales/features/
```

## 🔧 Development

### Local Testing

To test the CLI locally:

```bash
npm link
```

This creates a global symlink to your local development version.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
