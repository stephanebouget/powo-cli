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

console.log("POWO CLI load-locales Version", pjson.version);

var proxy = args && args.proxy;
var location = args && args.location;

var project = args && args.project;
var country = (args && args.country) || "XX";
var platform = args && args.platform;
var version = args && args.version;
var languages = args && args.languages;

if (!languages) {
  console.error("Error: --languages parameter is required");
  console.log(
    "Usage: node load-locales.js --project=<project> --location=<path> --platform=<platform> --version=<version> --languages=<lang1,lang2> [--country=<country>] [--proxy=<proxy>]"
  );
  process.exit(1);
}

languages = languages.split(",");
// Validate required parameters
if (!project) {
  console.error("Error: --project parameter is required");
  process.exit(1);
}

if (!location) {
  console.error("Error: --location parameter is required");
  process.exit(1);
}

if (!platform) {
  console.error("Error: --platform parameter is required");
  process.exit(1);
}

if (!version) {
  console.error("Error: --version parameter is required");
  process.exit(1);
}

location = utils.checkLocationPath(location);
project = utils.checkProjectName(project);

console.log("proxy", proxy);
console.log("project", project);
console.log("country", country);
console.log("platform", platform);
console.log("version", version);
console.log("languages", languages);
console.log("location", location);

// Helper function to make HTTP/HTTPS requests
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: "GET",
      timeout: 30000, // 30 seconds timeout
      headers: {
        "User-Agent": "POWO-CLI/" + pjson.version,
      },
    };

    // Add proxy support if needed
    if (proxy && options.proxy) {
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

// Process languages sequentially to avoid overwhelming the server
async function processLanguages() {
  if (!project || !location) {
    console.error("Project and location are required");
    return;
  }

  // Ensure directory exists
  if (!fs.existsSync(location)) {
    try {
      fs.mkdirSync(location, { recursive: true });
    } catch (err) {
      console.error("Failed to create directory:", err);
      return;
    }
  }

  for (const language of languages) {
    const requestUrl =
      CONFIG.API_URL +
      project +
      "/" +
      country +
      "/" +
      platform +
      "/" +
      version +
      "/" +
      language +
      "/Wording.json";

    try {
      console.log(`Downloading ${language}...`);
      const data = await makeRequest(requestUrl, { proxy: proxy });

      const filePath = path.join(location, language + ".json");
      fs.writeFileSync(filePath, data, "utf8");
      console.log(`✓ ${language}.json saved successfully`);
    } catch (error) {
      console.error(`✗ Failed to download ${language}:`, error.message);
    }
  }
}

// Start processing
processLanguages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
