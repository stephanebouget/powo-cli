#!/usr/bin/env node

/**
 * 🧪 Complete Test Suite for powo-cli Published Version
 * Tests all three CLI tools from the published npm package
 */

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, description) {
  console.log(`\n🚀 ${description}`);
  console.log(`Command: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    return false;
  }
}

function main() {
  console.log('🌐 powo-cli Published Version Test Suite');
  console.log('=========================================\n');
  
  let allTestsPassed = true;
  
  // Step 1: Install the published package
  console.log('📦 Step 1: Installing published powo-cli package...');
  allTestsPassed &= runCommand('npm install powo-cli', 'Package installation');
  
  // Step 2: Clean previous test results
  console.log('🧹 Step 2: Cleaning previous test results...');
  allTestsPassed &= runCommand('node cleanup.js', 'Cleanup');
  
  // Step 3: Test load-locales
  console.log('🌍 Step 3: Testing load-locales (Global translations)...');
  const loadLocalesCmd = 'npx load-locales --project="Demo Todo List" --country=XX --platform=web --version=draft --languages=fr,en --location=translations/global/';
  allTestsPassed &= runCommand(loadLocalesCmd, 'load-locales test');
  
  // Step 4: Test load-by-features
  console.log('🎯 Step 4: Testing load-by-features (Feature-based translations)...');
  const loadFeaturesCmd = 'npx load-by-features --project="Demo Todo List" --country=XX --platform=web --version=draft --location=translations/features/';
  allTestsPassed &= runCommand(loadFeaturesCmd, 'load-by-features test');
  
  // Step 5: Test load-by-modules
  console.log('🧩 Step 5: Testing load-by-modules (Module merging)...');
  const loadModulesCmd = 'npx load-by-modules --delivery="PayPortal Front" --modules="PayPortal,PayPortal Payment Config" --platform=web --versions=draft --languages=fr,en --location=translations/modules/';
  allTestsPassed &= runCommand(loadModulesCmd, 'load-by-modules test');
  
  // Step 6: Verify results
  console.log('🔍 Step 6: Verifying all results...');
  allTestsPassed &= runCommand('node verify-results.js', 'Results verification');
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('Your published powo-cli v3.0.0 is working perfectly!');
  } else {
    console.log('💥 SOME TESTS FAILED!');
    console.log('Please check the errors above and fix any issues.');
    process.exit(1);
  }
  console.log('='.repeat(50));
}

main();