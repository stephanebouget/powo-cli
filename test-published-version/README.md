# 🧪 powo-cli Published Version Testing

This directory contains scripts to test the **published version** of powo-cli from npm, ensuring that the package works correctly for end users.

## 📁 Files

- **`test-all.js`** - Complete test suite that runs all three CLI tools
- **`cleanup.js`** - Removes generated translation files for clean testing
- **`verify-results.js`** - Verifies that all expected files were generated
- **`package.json`** - Test environment configuration

## 🚀 Quick Test

Run the complete test suite:

```bash
node test-all.js
```

This will:

1. Install powo-cli from npm
2. Clean any previous test files
3. Test `load-locales` (global translations)
4. Test `load-by-features` (feature-based translations)
5. Test `load-by-modules` (module merging)
6. Verify all results

## 🔧 Individual Tests

You can also run individual commands:

```bash
# Install the published package
npm install powo-cli

# Clean test files
node cleanup.js

# Test global translations
npx load-locales --project="Demo Todo List" --country=XX --platform=web --version=draft --languages=fr,en --location=translations/global/

# Test feature-based translations
npx load-by-features --project="Demo Todo List" --country=XX --platform=web --version=draft --location=translations/features/

# Test module merging
npx load-by-modules --delivery="PayPortal Front" --modules="PayPortal,PayPortal Payment Config" --platform=web --versions=draft --languages=fr,en --location=translations/modules/

# Verify results
node verify-results.js
```

## 📊 Expected Results

After successful testing, you should have:

```
translations/
├── global/
│   ├── fr.json
│   └── en.json
├── features/
│   ├── fr/
│   │   ├── Main.json
│   │   ├── Settings.json
│   │   └── Wording.json
│   └── en/
│       ├── Main.json
│       ├── Settings.json
│       └── Wording.json
└── modules/
    ├── fr.json (merged PayPortal modules)
    └── en.json (merged PayPortal modules)
```

## ✅ Success Criteria

All tests pass if:

- ✅ No security vulnerabilities detected
- ✅ All three CLI tools execute without errors
- ✅ Translation files are generated in correct locations
- ✅ Files contain valid JSON data
- ✅ Module merging works correctly
