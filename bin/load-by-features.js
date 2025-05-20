#! /usr/bin/env node

var pjson = require("../package.json");
var args = require("minimist")(process.argv.slice(2));
var request = require("request");
var admZip = require("adm-zip");
var fs = require("fs");
var utils = require("./utils");

var CONFIG = require("./config.js").CONFIG;

console.log("POWO CLI load-by-features Version", pjson.version);

var proxy = args && args.proxy;
var location = args && args.location;

var project = args && args.project;
var country = (args && args.country) || "XX";
var platform = args && args.platform;
var version = args && args.version;

location = utils.checkLocationPath(location);
project = utils.checkProjectName(project);

console.log("proxy", proxy);
console.log("location", location);
console.log("project", project);
console.log("country", country);
console.log("platform", platform);
console.log("version", version);

var url =
  CONFIG.API_URL +
  project +
  "/" +
  country +
  "/" +
  platform +
  "/" +
  version +
  "/Configuration.zip";

if (project && location) {
  var zipFile = location + "Configuration.zip";

  if (!fs.existsSync(location)) {
    fs.mkdirSync(
      location,
      {
        recursive: true,
      },
      function (err) {
        if (err) throw err;
      }
    );
  }

  var options = {
    url: url,
    method: "GET",
  };

  if (proxy) {
    options.proxy = proxy;
  }

  request(options)
    .on("error", function (error) {
      console.error("Request error");
    })
    .pipe(fs.createWriteStream(zipFile))
    .on("finish", function () {
      console.log("finished downloading");
      var zip = new admZip(zipFile);
      console.log("start unzip");
      zip.extractAllTo(/*target path*/ location, /*overwrite*/ true);

      // Remove temp files
      fs.unlinkSync(location + "Config.json");
      fs.unlinkSync(location + "Configuration.zip");

      console.log("finished unzip");
    });
}
