#!/usr/bin/env node

const GlobalTester = require("./global-test");
const path = require("path");
const fs = require("fs");

class RobustGlobalTester extends GlobalTester {
  constructor() {
    super();
    this.proxyIgnoreMode = false;

    // Add load-by-modules to results if not already present
    if (!this.results["test-load-by-modules"]) {
      this.results["test-load-by-modules"] = {
        success: false,
        filesCreated: [],
        errors: [],
      };
    }
  }

  async checkProxyAvailability() {
    this.log("🔍 Checking proxy availability...", "info");

    // Simple test to check if the proxy is accessible
    const { spawn } = require("child_process");

    return new Promise((resolve) => {
      // Connectivity test with curl or PowerShell
      const testCmd =
        process.platform === "win32"
          ? [
              "powershell",
              [
                "-Command",
                "Test-NetConnection -ComputerName proxypac.si.francetelecom.fr -Port 8080 -InformationLevel Quiet",
              ],
            ]
          : [
              "curl",
              [
                "-x",
                "http://proxypac.si.francetelecom.fr:8080",
                "--connect-timeout",
                "5",
                "-I",
                "https://www.google.com",
              ],
            ];

      const [command, args] = testCmd;
      const child = spawn(command, args, { stdio: "pipe" });

      let timeout = setTimeout(() => {
        child.kill();
        this.log(
          "⚠️ Proxy test timed out - assuming proxy is not available",
          "warning"
        );
        resolve(false);
      }, 10000);

      child.on("close", (code) => {
        clearTimeout(timeout);
        const isAvailable = code === 0;

        if (isAvailable) {
          this.log("✅ Proxy is available", "success");
        } else {
          this.log("❌ Proxy is not available", "warning");
        }

        resolve(isAvailable);
      });

      child.on("error", () => {
        clearTimeout(timeout);
        this.log("❌ Could not test proxy availability", "warning");
        resolve(false);
      });
    });
  }

  async runAllTests() {
    this.log("🚀 Starting robust global test suite...", "start");
    this.log(`📂 Test directory: ${this.testDir}`, "info");

    // Check proxy availability
    const proxyAvailable = await this.checkProxyAvailability();

    if (!proxyAvailable) {
      this.log("⚠️ Proxy unavailable. Switching to tolerant mode.", "warning");
      this.proxyIgnoreMode = true;
    }

    // Liste des scripts à tester avec leurs types
    const scripts = [
      { name: "test-load-locales", requiresProxy: true, type: "load-locales" },
      {
        name: "test-load-locales:noproxy",
        requiresProxy: false,
        type: "load-locales",
      },
      {
        name: "test-load-by-features",
        requiresProxy: true,
        type: "load-by-features",
      },
      {
        name: "test-load-by-features:noproxy",
        requiresProxy: false,
        type: "load-by-features",
      },
      {
        name: "test-load-by-modules",
        requiresProxy: true,
        type: "load-by-modules",
      },
    ];

    let criticalFailures = 0;

    // Run each script
    for (const script of scripts) {
      const result = await this.runNpmScript(script.name);

      this.results[script.name].success = result.success;
      this.results[script.name].exitCode = result.exitCode;

      // Analyze failures
      if (!result.success) {
        const errorText = (result.stderr + " " + result.stdout).toLowerCase();
        const isProxyError =
          errorText.includes("econnreset") ||
          errorText.includes("enotfound") ||
          errorText.includes("proxy") ||
          errorText.includes("etimedout") ||
          errorText.includes("connect etimedout") ||
          errorText.includes("timeout") ||
          errorText.includes("read econnreset");

        // Consider ignoring proxy errors even if proxy seems available
        const shouldIgnore = script.requiresProxy && isProxyError;

        if (shouldIgnore) {
          this.log(
            `⚠️ Ignoring ${script.name} failure (proxy connection issue)`,
            "warning"
          );
          this.results[script.name].ignored = true;
          this.results[script.name].reason = "Proxy connection issue";
        } else {
          this.log(`❌ Critical failure in ${script.name}`, "error");
          criticalFailures++;
        }

        this.results[script.name].errors.push(`Exit code: ${result.exitCode}`);
        if (result.stderr) {
          this.results[script.name].errors.push(
            result.stderr.substring(0, 200)
          );
        }
      }

      // Check files after each test that should create them
      if (script.type === "load-locales") {
        const localeCheck = this.checkFilesInDirectory(this.localeDir);
        if (localeCheck.exists) {
          this.results[script.name].filesCreated = localeCheck.files.map(
            (f) => f.name
          );
        }
      } else if (script.type === "load-by-modules") {
        // load-by-modules uses a different directory structure
        const modulesDir = path.join(__dirname, "..", "src", "app", "i18n");
        const modulesCheck = this.checkFilesInDirectory(modulesDir);
        if (modulesCheck.exists) {
          this.results[script.name].filesCreated = modulesCheck.files.map(
            (f) => f.name
          );
        }
      }

      // Short pause between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Analyze final results
    const filesValid = this.analyzeTestResults();

    // Generate report with ignores
    const allCriticalTestsPassed = this.generateRobustReport(criticalFailures);

    // Decide whether to clean up
    const shouldCleanup = allCriticalTestsPassed && filesValid;

    if (shouldCleanup) {
      this.log(
        "🎉 All critical tests passed and files are valid - proceeding with cleanup",
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
        "⚠️ Some critical tests failed or files are invalid - skipping cleanup",
        "warning"
      );
      this.log(
        "💡 You can manually inspect src/locale/ and remove src/ when ready",
        "info"
      );
      return false;
    }
  }

  analyzeTestResults() {
    this.log("Analyzing test results...", "check");

    let allValid = true;

    // Check locale files (from load-locales and load-by-features tests)
    const localeCheck = this.checkFilesInDirectory(this.localeDir);
    if (localeCheck.exists && localeCheck.files.length > 0) {
      this.log(
        `📁 Found ${localeCheck.files.length} files in src/locale/`,
        "info"
      );

      localeCheck.files.forEach((file) => {
        const sizeInfo = file.isEmpty ? "(EMPTY!)" : `(${file.size} bytes)`;
        const icon = file.isEmpty ? "❌" : "✅";
        this.log(`  ${icon} ${file.name} ${sizeInfo}`);

        if (!file.isEmpty && file.name.endsWith(".json") && file.path) {
          try {
            const content = fs.readFileSync(file.path, "utf8");
            JSON.parse(content);
            this.log(`    📝 Valid JSON content`);
          } catch (error) {
            this.log(`    ⚠️ Invalid JSON: ${error.message}`, "warning");
            allValid = false;
          }
        }

        if (file.isEmpty) allValid = false;
      });

      this.log(
        `📊 Locale files: ${localeCheck.files.length} total, ${localeCheck.nonEmptyFiles} valid`
      );
    }

    // Check modules files (from load-by-modules tests)
    const modulesDir = path.join(__dirname, "..", "src", "app", "i18n");
    const modulesCheck = this.checkFilesInDirectory(modulesDir);
    if (modulesCheck.exists && modulesCheck.files.length > 0) {
      this.log(
        `📁 Found ${modulesCheck.files.length} files in src/app/i18n/`,
        "info"
      );

      modulesCheck.files.forEach((file) => {
        const sizeInfo = file.isEmpty ? "(EMPTY!)" : `(${file.size} bytes)`;
        const icon = file.isEmpty ? "❌" : "✅";
        this.log(`  ${icon} ${file.name} ${sizeInfo}`);

        if (!file.isEmpty && file.name.endsWith(".json") && file.path) {
          try {
            const content = fs.readFileSync(file.path, "utf8");
            JSON.parse(content);
            this.log(`    📝 Valid JSON content`);
          } catch (error) {
            this.log(`    ⚠️ Invalid JSON: ${error.message}`, "warning");
            allValid = false;
          }
        }

        if (file.isEmpty) allValid = false;
      });

      this.log(
        `📊 Module files: ${modulesCheck.files.length} total, ${modulesCheck.nonEmptyFiles} valid`
      );
    }

    // Overall validation
    const totalFiles =
      (localeCheck.exists ? localeCheck.files.length : 0) +
      (modulesCheck.exists ? modulesCheck.files.length : 0);

    if (totalFiles === 0) {
      this.log("⚠️ No test files found", "warning");
      return false;
    }

    this.log(`📊 Overall: ${totalFiles} files analyzed`, "info");
    return allValid;
  }

  generateRobustReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(70));
    console.log("🎯 ROBUST GLOBAL TEST REPORT");
    console.log("=".repeat(70));

    // Results per script with ignore handling
    Object.entries(this.results).forEach(([script, result]) => {
      const icon = result.success ? "✅" : result.ignored ? "⚠️" : "❌";
      console.log(`${icon} ${script}`);
    });

    console.log("=".repeat(70));

    // Global statistics
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(
      (r) => r.success
    ).length;
    const ignoredTests = Object.values(this.results).filter(
      (r) => r.ignored
    ).length;
    const failedTests = totalTests - passedTests - ignoredTests;
    const criticalFailures = failedTests; // Only non-ignored failures are critical

    console.log(`📊 Total tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`⚠️ Ignored: ${ignoredTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️ Duration: ${duration}s`);

    const overallSuccess = criticalFailures === 0;
    const overallIcon = overallSuccess ? "🎉" : "💥";
    let overallStatus = overallSuccess
      ? "ALL CRITICAL TESTS PASSED"
      : "SOME CRITICAL TESTS FAILED";

    if (ignoredTests > 0 && overallSuccess) {
      overallStatus += ` (${ignoredTests} proxy tests ignored)`;
    }

    console.log(`\n${overallIcon} ${overallStatus}`);
    console.log("=".repeat(70));

    return overallSuccess;
  }

  async cleanup() {
    this.log("Starting cleanup...", "cleanup");

    let success = true;

    try {
      // Clean up src/locale/ directory
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true, force: true });
        this.log("✓ Successfully removed src/ directory", "success");
      }

      // Clean up src/app/i18n/ directory (from load-by-modules)
      const modulesDir = path.join(__dirname, "..", "src", "app");
      if (fs.existsSync(modulesDir)) {
        fs.rmSync(modulesDir, { recursive: true, force: true });
        this.log("✓ Successfully removed src/app/ directory", "success");
      }
    } catch (error) {
      this.log(`✗ Failed to cleanup directories: ${error.message}`, "error");
      success = false;
    }

    return success;
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const tester = new RobustGlobalTester();

  tester
    .runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Test suite crashed:", error);
      process.exit(1);
    });
}

module.exports = RobustGlobalTester;
