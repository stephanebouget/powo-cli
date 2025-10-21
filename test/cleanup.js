#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧹 POWO CLI Test Cleanup Tool");
console.log("=============================\n");

const srcDir = path.join(__dirname, "..", "src");
const localeDir = path.join(srcDir, "locale");

function checkDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return { exists: false, files: [] };
  }

  try {
    const files = fs.readdirSync(dir);
    return { exists: true, files: files };
  } catch (error) {
    return { exists: false, files: [], error: error.message };
  }
}

function cleanup() {
  console.log("🗑️ Starting cleanup process...\n");

  // Check what exists
  const srcCheck = checkDirectory(srcDir);
  const localeCheck = checkDirectory(localeDir);

  if (!srcCheck.exists) {
    console.log("✅ src/ directory does not exist - nothing to clean");
    return true;
  }

  console.log(`📁 Found src/ directory with ${srcCheck.files.length} items`);

  if (localeCheck.exists) {
    console.log(
      `📁 Found src/locale/ directory with ${localeCheck.files.length} files:`
    );
    localeCheck.files.forEach((file) => {
      const filePath = path.join(localeDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      console.log(`   📄 ${file} (${size} bytes)`);
    });
  }

  console.log(
    "\n❓ Are you sure you want to delete the entire src/ directory? (y/N)"
  );

  // Read user input
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", (key) => {
    const answer = key.toString().toLowerCase();

    if (answer === "y" || answer === "yes") {
      console.log("\n🗑️ Deleting src/ directory...");

      try {
        fs.rmSync(srcDir, { recursive: true, force: true });
        console.log("✅ Successfully deleted src/ directory");
        console.log("✨ Cleanup completed!");
      } catch (error) {
        console.log(`❌ Failed to delete src/ directory: ${error.message}`);
        process.exit(1);
      }

      process.exit(0);
    } else {
      console.log("\n❌ Cleanup canceled");
      console.log("💡 The src/ directory has been kept");
      process.exit(0);
    }
  });
}

function forceCleanup() {
  console.log("🗑️ Force cleanup mode - deleting without confirmation...\n");

  try {
    if (fs.existsSync(srcDir)) {
      fs.rmSync(srcDir, { recursive: true, force: true });
      console.log("✅ Successfully deleted src/ directory");
      console.log("✨ Force cleanup completed!");
    } else {
      console.log("✅ src/ directory does not exist - nothing to clean");
    }
    return true;
  } catch (error) {
    console.log(`❌ Failed to delete src/ directory: ${error.message}`);
    return false;
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const forceMode = args.includes("--force") || args.includes("-f");

if (forceMode) {
  const success = forceCleanup();
  process.exit(success ? 0 : 1);
} else {
  cleanup();
}
