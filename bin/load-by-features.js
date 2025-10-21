#! /usr/bin/env node

var pjson = require("../package.json");
var args = require("minimist")(process.argv.slice(2));
var https = require("https");
var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var utils = require("./utils");

var CONFIG = require("./config.js").CONFIG;

console.log("POWO CLI load-by-features Version", pjson.version);

var proxy = args && args.proxy;
var location = args && args.location;

var project = args && args.project;
var country = (args && args.country) || "XX";
var platform = args && args.platform;
var version = args && args.version;

// Validate required parameters
if (!project) {
  console.error("Error: --project parameter is required");
  console.log(
    "Usage: node load-by-features.js --project=<project> --location=<path> --platform=<platform> --version=<version> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!location) {
  console.error("Error: --location parameter is required");
  console.log(
    "Usage: node load-by-features.js --project=<project> --location=<path> --platform=<platform> --version=<version> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!platform) {
  console.error("Error: --platform parameter is required");
  console.log(
    "Usage: node load-by-features.js --project=<project> --location=<path> --platform=<platform> --version=<version> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

if (!version) {
  console.error("Error: --version parameter is required");
  console.log(
    "Usage: node load-by-features.js --project=<project> --location=<path> --platform=<platform> --version=<version> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

location = utils.checkLocationPath(location);
project = utils.checkProjectName(project);

console.log("proxy", proxy);
console.log("location", location);
console.log("project", project);
console.log("country", country);
console.log("platform", platform);
console.log("version", version);

// Helper function to download file
function downloadFile(requestUrl, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: "GET",
      timeout: 60000, // 60 seconds timeout for large files
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
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        // Handle redirects
        return downloadFile(res.headers.location, outputPath, options)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(
          new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`)
        );
      }

      const fileStream = fs.createWriteStream(outputPath);

      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });

      fileStream.on("error", (error) => {
        fs.unlink(outputPath, () => {}); // Delete incomplete file
        reject(error);
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

// Secure zip extraction using yauzl
function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    const yauzl = require("yauzl");

    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();

      zipfile.on("entry", (entry) => {
        // Security check: prevent directory traversal attacks
        if (/\.\./.test(entry.fileName)) {
          console.warn(
            `Skipping potentially malicious file: ${entry.fileName}`
          );
          zipfile.readEntry();
          return;
        }

        const outputPath = path.join(extractPath, entry.fileName);

        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          fs.mkdir(outputPath, { recursive: true }, (err) => {
            if (err)
              console.warn(
                `Warning: Could not create directory ${outputPath}:`,
                err.message
              );
            zipfile.readEntry();
          });
        } else {
          // File entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            // Ensure directory exists
            fs.mkdir(path.dirname(outputPath), { recursive: true }, (err) => {
              if (err) {
                console.warn(
                  `Warning: Could not create directory for ${outputPath}:`,
                  err.message
                );
                zipfile.readEntry();
                return;
              }

              const writeStream = fs.createWriteStream(outputPath);

              writeStream.on("close", () => {
                zipfile.readEntry();
              });

              writeStream.on("error", (err) => {
                console.warn(
                  `Warning: Could not write file ${outputPath}:`,
                  err.message
                );
                zipfile.readEntry();
              });

              readStream.pipe(writeStream);
            });
          });
        }
      });

      zipfile.on("end", () => {
        resolve();
      });

      zipfile.on("error", (err) => {
        reject(err);
      });
    });
  });
}

// Main download and extraction process
async function downloadAndExtract() {
  if (!project || !location) {
    console.error("Project and location are required");
    return;
  }

  const requestUrl =
    CONFIG.API_URL +
    project +
    "/" +
    country +
    "/" +
    platform +
    "/" +
    version +
    "/Configuration.zip";

  const zipFile = path.join(location, "Configuration.zip");

  try {
    // Ensure directory exists
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location, { recursive: true });
    }

    console.log("Starting download...");
    await downloadFile(requestUrl, zipFile);
    console.log("Download completed");

    console.log("Starting extraction...");
    await extractZip(zipFile, location);
    console.log("Extraction completed");

    // Clean up temporary files
    try {
      const configPath = path.join(location, "Config.json");
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }

      if (fs.existsSync(zipFile)) {
        fs.unlinkSync(zipFile);
      }
      console.log("Cleanup completed");
    } catch (cleanupError) {
      console.warn(
        "Warning: Could not clean up temporary files:",
        cleanupError.message
      );
    }
  } catch (error) {
    console.error("Error:", error.message);

    // Clean up on error
    try {
      if (fs.existsSync(zipFile)) {
        fs.unlinkSync(zipFile);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Start the process
downloadAndExtract();
