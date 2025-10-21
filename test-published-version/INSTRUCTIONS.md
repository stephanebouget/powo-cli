# 🎯 How to Test Your Published powo-cli Package

## 🚀 Quick Test (Recommended)

Simply run the automated test suite:

```bash
# Navigate to the test directory
cd test-published-version

# Run the complete test
node test-all.js
```

Or use the Windows batch file:

```bash
# Double-click or run from command line
quick-test.bat
```

## 📋 What the Test Does

The test suite will:

1. **📦 Install** your published powo-cli package from npm
2. **🧹 Clean** any previous test files
3. **🌍 Test load-locales** - Downloads global translations (fr.json, en.json)
4. **🎯 Test load-by-features** - Downloads feature-based translations (organized by features)
5. **🧩 Test load-by-modules** - Downloads and merges module translations
6. **🔍 Verify** that all files were created correctly

## ✅ Success Indicators

You'll know your package works if you see:

```
🎉 ALL TESTS PASSED!
Your published powo-cli v3.0.0 is working perfectly!
```

And the following files are created:

```
translations/
├── global/           ← load-locales output
│   ├── fr.json
│   └── en.json
├── features/         ← load-by-features output
│   ├── fr/
│   └── en/
└── modules/          ← load-by-modules output
    ├── fr.json (merged)
    └── en.json (merged)
```

## 🔧 Manual Testing

If you prefer to test manually:

```bash
# Install your package
npm install powo-cli

# Test each command
npx load-locales --project="Demo Todo List" --platform=web --version=draft --languages=fr,en --location=test-output/
npx load-by-features --project="Demo Todo List" --platform=web --version=draft --location=test-output/
npx load-by-modules --delivery="PayPortal Front" --modules="PayPortal,PayPortal Payment Config" --platform=web --versions=draft --languages=fr,en --location=test-output/
```

## 🎯 Why This Testing is Important

- ✅ **Real-world validation**: Tests the actual package users will install
- ✅ **Zero vulnerabilities**: Confirms your security fixes work in production
- ✅ **All three tools**: Validates load-locales, load-by-features, and load-by-modules
- ✅ **Cross-platform**: Works on Windows, Mac, and Linux
- ✅ **Automated verification**: No manual file checking required

---

**🎉 Your powo-cli v3.0.0 is ready for production use!**
