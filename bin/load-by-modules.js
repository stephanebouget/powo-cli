#! /usr/bin/env node

const pjson = require("../package.json");
let args = require("minimist")(process.argv.slice(2));
const https = require("https");
const http = require("http");
let fs = require("fs");
const path = require("path");
const url = require("url");
var utils = require("./utils");

console.log("POWO CLI load-by-modules Version", pjson.version);

let proxy = args && args.proxy;
let location = args && args.location;

let delivery = args && args.delivery;
let modules = args && args.modules;
let country = (args && args.country) || "XX";
let platform = args && args.platform;
let versions = args && args.versions;
let languages = args && args.languages;

// Validate required parameters
if (!delivery) {
  console.error("Error: --delivery parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!modules) {
  console.error("Error: --modules parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!location) {
  console.error("Error: --location parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!platform) {
  console.error("Error: --platform parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!versions) {
  console.error("Error: --versions parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!languages) {
  console.error("Error: --languages parameter is required");
  console.log(
    "Usage: node load-by-modules.js --delivery=<delivery> --modules=<module1,module2> --location=<path> --platform=<platform> --versions=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

modules = modules.split(",");
languages = languages.split(",");
location = utils.checkLocationPath(location);
for (let i = 0; i < modules.length; i++) {
  modules[i] = utils.checkProjectName(modules[i]);
}
if (versions.includes(",")) {
  versions = versions.split(",");
  if (versions.length < modules.length) {
    versions = versions.concat(
      Array(modules.length - versions.length).fill("draft")
    );
  }
} else {
  versions = Array(modules.length).fill(versions);
}

console.log("proxy", proxy);
console.log("delivery", delivery);
console.log("modules", modules);
console.log("country", country);
console.log("platform", platform);
console.log("versions", versions);
console.log("languages", languages);
console.log("location", location);

// Helper function to make HTTP/HTTPS requests
function makeRequest(requestUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: "GET",
      timeout: 4000, // 10 seconds timeout (faster failure detection)
      headers: {
        "User-Agent": "POWO-CLI/" + pjson.version,
      },
    };

    // Add proxy support if needed
    if (proxy) {
      const proxyUrl = url.parse(proxy);
      requestOptions.hostname = proxyUrl.hostname;
      requestOptions.port = proxyUrl.port;
      requestOptions.path = requestUrl;
      requestOptions.headers["Host"] = parsedUrl.hostname;
    }

    const req = client.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

// Process each language
async function processLanguages() {
  // Ensure directory exists
  if (!fs.existsSync(location)) {
    try {
      fs.mkdirSync(location, { recursive: true });
    } catch (err) {
      console.error("Failed to create directory:", err);
      process.exit(1);
    }
  }

  for (const language of languages) {
    console.log(`\nProcessing language: ${language}`);
    const tempFiles = [];

    try {
      // Download all modules for this language
      for (let i = 0; i < modules.length; i++) {
        const project = modules[i];
        const version = versions[i];

        const requestUrl = [
          "https://s3-region01.cloudavenue.orange-business.com/s3selfcare-powo-prod-dist",
          project,
          country,
          platform,
          version,
          language,
          "Wording.json",
        ].join("/");

        console.log(`  Downloading ${project} (${version})...`);
        console.log(`  URL: ${requestUrl}`);

        try {
          const data = await makeRequest(requestUrl);
          const projectFile = path.join(
            location,
            `${language}-${project}.json`
          );
          fs.writeFileSync(projectFile, data, "utf8");
          tempFiles.push(projectFile);
          console.log(`  ✓ ${project}.json downloaded successfully`);
        } catch (error) {
          console.error(`  ✗ Failed to download ${project}: ${error.message}`);
          throw error;
        }
      }

      // Merge all module data
      console.log(`  Merging ${modules.length} modules...`);
      let mergedData = {};

      for (let i = 0; i < modules.length; i++) {
        const project = modules[i];
        const projectFile = path.join(location, `${language}-${project}.json`);

        try {
          const data = JSON.parse(fs.readFileSync(projectFile, "utf8"));
          mergedData = {
            ...mergedData,
            ...data,
            AUTOMATED_GENERATED_FILE: {
              ...mergedData.AUTOMATED_GENERATED_FILE,
              Name: delivery,
              Version: country + "_VX_DRAFT",
              ReferenceVersion: "VX",
            },
            Wording_Version: country + "_VX_DRAFT",
            Wording_Reference_Version: "VX",
          };
        } catch (parseError) {
          console.error(
            `  ✗ Failed to parse ${project}: ${parseError.message}`
          );
          throw parseError;
        }
      }

      // Write merged file
      const finalFile = path.join(location, `${language}.json`);
      fs.writeFileSync(finalFile, JSON.stringify(mergedData, null, 2), "utf8");
      console.log(`  ✓ Merged file saved: ${language}.json`);

      // Clean up temporary files
      tempFiles.forEach((tempFile) => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.warn(
            `  ⚠ Could not clean up ${tempFile}: ${cleanupError.message}`
          );
        }
      });

      console.log(`✅ ${language} completed successfully`);
    } catch (error) {
      console.error(`❌ Failed to process ${language}: ${error.message}`);

      // Clean up temporary files on error
      tempFiles.forEach((tempFile) => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      });

      throw error;
    }
  }
}

// Start processing
processLanguages()
  .then(() => {
    console.log("\n🎉 All languages processed successfully!");
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error.message);
    process.exit(1);
  });
