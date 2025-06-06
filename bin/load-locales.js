#! /usr/bin/env node
var pjson = require("../package.json");
var args = require("minimist")(process.argv.slice(2));
var request = require("request");
var fs = require("fs");
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

    if (project && location) {
      var options = {};
      options.url = url;
      options.method = "GET";
      if (proxy) {
        options.proxy = proxy;
      }

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
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
          fs.writeFileSync(location + language + ".json", body);
        } else {
          // console.error(error, response, body);
          console.log("Request error");
        }
      });
    }
  })(i);
}
