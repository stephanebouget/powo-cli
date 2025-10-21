#!/usr/bin/env node

/**
 * 🔍 Verification Script for powo-cli Published Version Testing
 * Checks that all translation files were generated correctly
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${description}: ${filePath} (${stats.size} bytes)`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - NOT FOUND`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    console.log(`✓ ${description}: ${dirPath} (${files.length} items)`);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
    return true;
  } else {
    console.log(`❌ ${description}: ${dirPath} - NOT FOUND`);
    return false;
  }
}

function verifyResults() {
  console.log('🔍 Verifying test results...\n');
  
  let allPassed = true;
  
  // Check global translations (load-locales)
  console.log('📁 Global Translations (load-locales):');
  allPassed &= checkFile('translations/global/fr.json', 'French global');
  allPassed &= checkFile('translations/global/en.json', 'English global');
  console.log();
  
  // Check feature translations (load-by-features)
  console.log('📁 Feature Translations (load-by-features):');
  allPassed &= checkDirectory('translations/features/fr', 'French features');
  allPassed &= checkDirectory('translations/features/en', 'English features');
  console.log();
  
  // Check module translations (load-by-modules)
  console.log('📁 Module Translations (load-by-modules):');
  allPassed &= checkFile('translations/modules/fr.json', 'French modules');
  allPassed &= checkFile('translations/modules/en.json', 'English modules');
  console.log();
  
  if (allPassed) {
    console.log('🎉 All tests PASSED! Your published powo-cli package works correctly.');
  } else {
    console.log('💥 Some tests FAILED! Check the output above for details.');
    process.exit(1);
  }
}

verifyResults();