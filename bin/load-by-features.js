#! /usr/bin/env node

var pjson = require("../package.json");
var args = require("minimist")(process.argv.slice(2));
var axios = require("axios");
var admZip = require("adm-zip");
var fs = require("fs");
var utils = require("./utils");

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
  "https://oss.eu-west-0.prod-cloud-ocb.orange-business.com/powo-prod-dist/" +
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

  var axiosConfig = {
    responseType: "stream",
  };

  if (proxy) {
    axiosConfig.httpAgent = new require("http-proxy-agent")(proxy);
    axiosConfig.httpsAgent = new require("https-proxy-agent")(proxy);
  }

  axios
    .get(url, axiosConfig)
    .then(function (response) {
      response.data.pipe(fs.createWriteStream(zipFile));
      response.data.on("end", function () {
        console.log("finished downloading");
        var zip = new admZip(zipFile);
        console.log("start unzip");
        zip.extractAllTo(location, true);

        // Remove temp files
        if (fs.existsSync(location + "Config.json")) {
          fs.unlinkSync(location + "Config.json");
        }
        if (fs.existsSync(location + "Configuration.json")) {
          fs.unlinkSync(location + "Configuration.json");
        }

        console.log("finished unzip");
      });
    })
    .catch(function (error) {
      console.error("Request error", error);
    });
}
