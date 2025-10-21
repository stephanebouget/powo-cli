#!/usr/bin/env node

/**
 * 🧹 Cleanup Script for powo-cli Published Version Testing
 * Removes all generated translation files to ensure clean testing
 */

const fs = require('fs');
const path = require('path');

function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectoryRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function cleanup() {
  console.log('🧹 Starting cleanup of test translations...');
  
  const dirs = [
    'translations/global',
    'translations/features',
    'translations/modules',
    'translations'
  ];
  
  dirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        removeDirectoryRecursive(dir);
        console.log(`✓ Removed ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠ Could not remove ${dir}: ${error.message}`);
    }
  });
  
  console.log('✅ Cleanup completed!\n');
}

cleanup();