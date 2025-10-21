# POWO CLI Test Scripts

This directory contains comprehensive test scripts for POWO CLI functionality and security validation.

## 🚀 Quick Start

### Complete Test Suite

```bash
# Windows
.\run-tests.bat

# Linux/Mac
./run-tests.sh

# Direct
node ./test/complete-test.js
```

### Robust Test Suite (recommended)

```bash
node ./test/robust-global-test.js
```

## 📋 Available Scripts

### 1. `global-test.js` - Standard Global Test

Executes all npm tests and validates results:

- ✅ `test-load-locales` (with proxy)
- ✅ `test-load-locales:noproxy`
- ✅ `test-load-by-features` (with proxy)
- ✅ `test-load-by-features:noproxy`
- ✅ `test-load-by-modules` (with proxy)
- ✅ `test-load-by-modules:noproxy`

**Features:**

- ✔️ Sequential execution of all tests
- ✔️ JSON file validity verification
- ✔️ Automatic cleanup on success
- ✔️ Detailed statistics report

### 2. `robust-global-test.js` - Robust Global Test

Enhanced version with intelligent proxy handling:

**Additional Features:**

- 🔍 **Automatic proxy detection** - tests connectivity before running tests
- ⚠️ **Tolerant mode** - ignores proxy failures when proxy unavailable
- 🎯 **Critical tests only** - focuses on essential functionality
- 📊 **Detailed reporting** with distinction between critical failures and ignored ones

## 🔍 What the Scripts Test

### Tests Load-Locales

- Download JSON translation files
- HTTP proxy support
- Network error handling
- Downloaded JSON validation

### Tests Load-By-Features

- Download ZIP archives
- Secure file extraction
- Proxy support for large files
- Temporary file cleanup

### Tests Load-By-Modules

- Download multiple module JSON files
- Module merging and combination
- Multi-language processing
- Proxy support for batch downloads
- Temporary file management

### Validations Performed

- ✅ **File existence** - verifies files are created
- ✅ **Non-zero size** - ensures files are not empty
- ✅ **Valid JSON** - parses and validates JSON syntax
- ✅ **Cleanup** - removes `src/` if everything is OK

## 📊 Report Format

```
🎯 ROBUST GLOBAL TEST REPORT
======================================================================
✅ test-load-locales              PASSED
     Files: en.json, fr.json
⚠️ test-load-locales:proxy        IGNORED (proxy unavailable)
✅ test-load-by-features:noproxy  PASSED
❌ test-load-by-features          FAILED
     Errors: 1

📊 Total tests: 6
✅ Passed: 4
⚠️ Ignored: 1
❌ Failed: 1
⏱️ Duration: 12.45s

🎉 ALL CRITICAL TESTS PASSED (1 proxy tests ignored)
```

## 🛠️ Troubleshooting

### Proxy Errors

If you see `ECONNRESET` or `ETIMEDOUT` errors:

- Use `robust-global-test.js` which automatically ignores these errors
- Or test without proxy using `:noproxy` versions

### Missing Files

If `src/locale/` is not created:

- Check network connectivity
- Ensure the project "Demo Todo List" exists on the server
- Verify parameters in `package.json`

### Manual Cleanup

If automatic cleanup fails:

```bash
# Windows
rmdir /s /q src

# Linux/Mac
rm -rf src
```

## 📝 Notes

- Tests use the "Demo Todo List" project configured in `package.json`
- The `src/locale/` directory is created temporarily for tests
- Automatic cleanup only happens if **all critical tests** pass
- Test files are in the `test/` folder and don't pollute the main code
