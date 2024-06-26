#! /usr/bin/env node
var pjson = require("../package.json");
var args = require("minimist")(process.argv.slice(2));
var axios = require("axios");
var fs = require("fs");
var utils = require("./utils");

console.log("POWO CLI load-locales Version", pjson.version);

var proxy = args && args.proxy;
var location = args && args.location;

var project = args && args.project;
var country = (args && args.country) || "XX";
var platform = args && args.platform;
var version = args && args.version;
var languages = args && args.languages;

languages = languages.split(",");
location = utils.checkLocationPath(location);
project = utils.checkProjectName(project);

console.log("proxy", proxy);
console.log("project", project);
console.log("country", country);
console.log("platform", platform);
console.log("version", version);
console.log("languages", languages);
console.log("location", location);

for (var i = 0; i < languages.length; i++) {
  (function () {
    var language = languages[i];

    var url =
      "https://oss.eu-west-0.prod-cloud-ocb.orange-business.com/powo-prod-dist/" +
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

    if (project && location) {
      var axiosConfig = {};
      if (proxy) {
        axiosConfig.proxy = false;
        axiosConfig.httpAgent = new require("http-proxy-agent")(proxy);
        axiosConfig.httpsAgent = new require("https-proxy-agent")(proxy);
      }

      axios
        .get(url, axiosConfig)
        .then(function (response) {
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
          fs.writeFileSync(location + language + ".json", response.data);
        })
        .catch(function (error) {
          console.error("Request error", error);
        });
    }
  })(i);
}
