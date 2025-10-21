#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class GlobalTester {
  constructor() {
    this.testDir = path.join(__dirname, "..", "src");
    this.localeDir = path.join(this.testDir, "locale");
    this.results = {
      "test-load-locales": { success: false, filesCreated: [], errors: [] },
      "test-load-locales:noproxy": {
        success: false,
        filesCreated: [],
        errors: [],
      },
      "test-load-by-features": { success: false, filesCreated: [], errors: [] },
      "test-load-by-features:noproxy": {
        success: false,
        filesCreated: [],
        errors: [],
      },
    };
    this.startTime = Date.now();
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      start: "🚀",
      cleanup: "🧹",
      check: "🔍",
    };
    console.log(`[${timestamp}] ${icons[type] || "ℹ️"} ${message}`);
  }

  async runNpmScript(scriptName) {
    return new Promise((resolve) => {
      this.log(`Running npm script: ${scriptName}`, "start");

      const child = spawn("npm", ["run", scriptName], {
        cwd: path.join(__dirname, ".."),
        stdio: "pipe", // Capture output for analysis
        shell: true,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const result = {
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          success: code === 0,
        };

        if (code === 0) {
          this.log(`✓ ${scriptName} completed successfully`, "success");
        } else {
          this.log(`✗ ${scriptName} failed with exit code ${code}`, "error");
          if (stderr) {
            console.log("STDERR:", stderr.substring(0, 500));
          }
        }

        resolve(result);
      });

      child.on("error", (error) => {
        this.log(`✗ ${scriptName} failed to start: ${error.message}`, "error");
        resolve({
          exitCode: -1,
          stdout: "",
          stderr: error.message,
          success: false,
        });
      });
    });
  }

  checkFilesInDirectory(directory) {
    const files = [];

    if (!fs.existsSync(directory)) {
      return { exists: false, files: [] };
    }

    try {
      const dirFiles = fs.readdirSync(directory);
      dirFiles.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        files.push({ name: file, size: stats.size });
      });
      return { exists: true, files: files };
    } catch (error) {
      return { exists: false, files: [], error: error.message };
    }
  }

  analyzeTestResults() {
    this.log("Analyzing test results...", "check");

    // Check created files
    const localeCheck = this.checkFilesInDirectory(this.localeDir);

    if (!localeCheck.exists) {
      this.log("No files found in src/locale/", "warning");
      return false;
    }

    this.log(
      `📁 Found ${localeCheck.files.length} files in src/locale/`,
      "info"
    );

    // Analyze each file
    localeCheck.files.forEach((file) => {
      if (file.size > 0) {
        this.log(`✅ ${file.name} is valid (${file.size} bytes)`, "success");
      } else {
        this.log(`❌ ${file.name} is empty`, "error");
      }
    });

    // Global statistics
    const nonEmptyFiles = localeCheck.files.filter(
      (file) => file.size > 0
    ).length;
    const emptyFiles = localeCheck.files.length - nonEmptyFiles;

    this.log(`📊 Total files: ${localeCheck.files.length}`, "info");
    this.log(`📊 Non-empty files: ${nonEmptyFiles}`, "info");
    this.log(`📊 Empty files: ${emptyFiles}`, "info");

    // Success criteria
    const hasValidFiles = nonEmptyFiles > 0;
    const hasNoEmptyFiles = emptyFiles === 0;

    return hasValidFiles && hasNoEmptyFiles;
  }

  async cleanup() {
    this.log("Starting cleanup...", "cleanup");

    try {
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true, force: true });
        this.log("✅ Cleanup completed successfully", "success");
      } else {
        this.log("✅ Nothing to clean", "success");
      }
    } catch (error) {
      this.log(`❌ Cleanup failed: ${error.message}`, "error");
    }
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("🎯 GLOBAL TEST REPORT");
    console.log("=".repeat(60));

    // Results per script
    Object.entries(this.results).forEach(([script, result]) => {
      const icon = result.success ? "✅" : "❌";
      console.log(`${icon} ${script}`);
    });

    console.log("=".repeat(60));

    // Global statistics
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(
      (r) => r.success
    ).length;
    const failedTests = totalTests - passedTests;

    console.log(`📊 Total tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️ Duration: ${duration}s`);

    const overallSuccess = failedTests === 0;
    const overallIcon = overallSuccess ? "🎉" : "💥";
    const overallStatus = overallSuccess
      ? "ALL TESTS PASSED"
      : "SOME TESTS FAILED";

    console.log(`\n${overallIcon} ${overallStatus}`);
    console.log("=".repeat(60));
  }

  async runAllTests() {
    this.log("🚀 Starting global test suite...", "start");
    this.log(`📂 Test directory: ${this.testDir}`, "info");

    // Liste des scripts à tester
    const scripts = [
      "test-load-locales",
      "test-load-locales:noproxy",
      "test-load-by-features",
      "test-load-by-features:noproxy",
    ];

    // Exécuter chaque script
    for (const script of scripts) {
      const result = await this.runNpmScript(script);

      this.results[script].success = result.success;
      this.results[script].exitCode = result.exitCode;

      if (!result.success) {
        this.results[script].errors.push(`Exit code: ${result.exitCode}`);
        if (result.stderr) {
          this.results[script].errors.push(result.stderr);
        }
      }

      // Vérifier les fichiers après chaque test qui devrait en créer
      if (script.includes("load-locales")) {
        const localeCheck = this.checkFilesInDirectory(this.localeDir);
        if (localeCheck.exists) {
          this.results[script].filesCreated = localeCheck.files.map(
            (f) => f.name
          );
        }
      }

      // Petite pause entre les tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Analyser les résultats finaux
    const filesValid = this.analyzeTestResults();

    // Générer le rapport
    const allTestsPassed = this.generateReport();

    // Décider si on doit nettoyer
    const shouldCleanup = allTestsPassed && filesValid;

    if (shouldCleanup) {
      this.log(
        "🎉 All tests passed and files are valid - proceeding with cleanup",
        "success"
      );
      const cleanupSuccess = await this.cleanup();

      if (cleanupSuccess) {
        this.log(
          "✨ Test suite completed successfully with cleanup",
          "success"
        );
        return true;
      } else {
        this.log("⚠️ Tests passed but cleanup failed", "warning");
        return false;
      }
    } else {
      this.log(
        "⚠️ Some tests failed or files are invalid - skipping cleanup",
        "warning"
      );
      this.log(
        "💡 You can manually inspect src/locale/ and remove src/ when ready",
        "info"
      );
      return false;
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const tester = new GlobalTester();

  tester
    .runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

module.exports = GlobalTester;
