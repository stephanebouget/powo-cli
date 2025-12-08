# 🌐 powo-cli

[![npm version](https://badge.fury.io/js/powo-cli.svg)](https://badge.fury.io/js/powo-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**powo-cli** is a powerful Node.js module designed to seamlessly import Powo translations into your web projects. Streamline your internationalization workflow with support for multiple platforms and flexible translation management.

[<img width="736" height="298" alt="image" src="https://github.com/user-attachments/assets/817ffe74-25f4-460e-a222-12eb8feb8531" />
](https://private-user-images.githubusercontent.com/13203455/283417030-3a0f7dd5-dbc8-42d1-9700-94f4a5ef1342.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjUxODYzNzAsIm5iZiI6MTc2NTE4NjA3MCwicGF0aCI6Ii8xMzIwMzQ1NS8yODM0MTcwMzAtM2EwZjdkZDUtZGJjOC00MmQxLTk3MDAtOTRmNGE1ZWYxMzQyLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEyMDglMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMjA4VDA5Mjc1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWNhNjJjYzBlOWY5YTk1ZmI0ZmQ2NDI4YjFjOThlYTEwOGU1OWNmYmRmMTY5ZTBjMGRlODgwZmMzM2RiYmJmMzUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.TS3gQQxPCiPMyKjOrQbTrlX5cNcUHShdrsTgR8zAnZ0)

## ✨ Features

- Multi-language support with automatic file generation
- Flexible configuration options for different project types
- Cross-platform support (Android, iOS, Web, Robot)
- Support for global, feature-based, and module-based translation loading
- Version management (latest approved or draft translations)
- Module merging capabilities for complex multi-project architectures
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

### 🧩 Module-Based Translation Merging

Combine translations from multiple modules into unified language files:

```json
{
  "scripts": {
    "powo:modules": "load-by-modules --delivery=MyDelivery --modules=ModuleA,ModuleB,ModuleC --platform=web --versions=last --languages=fr,en --location=src/locales/"
  }
}
```

This command downloads translations from multiple modules and merges them into consolidated language files, perfect for micro-service architectures or multi-team projects.

#### 🔧 Module Mode Options

| Option      | Description                                               | Required | Default |
| ----------- | --------------------------------------------------------- | -------- | ------- |
| `delivery`  | Delivery identifier for module grouping                   | ✅       | -       |
| `modules`   | Comma-separated list of module names to merge             | ✅       | -       |
| `country`   | Country code                                              | ❌       | `XX`    |
| `platform`  | Target platform (`Android`, `iOS`, `web`, `robot`)        | ✅       | -       |
| `versions`  | Version for each module (single value or comma-separated) | ✅       | -       |
| `languages` | Comma-separated list of languages to generate             | ✅       | -       |
| `location`  | Destination folder path                                   | ✅       | -       |
| `proxy`     | Proxy URL (format: `http://proxy.fr:8080`)                | ❌       | -       |

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

### Module Merging for Microservices

```bash
# Merge translations from multiple modules into unified files
load-by-modules --delivery=MainApp --modules=AuthModule,PaymentModule,UserModule --platform=web --versions=last --languages=fr,en --location=src/i18n/
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
