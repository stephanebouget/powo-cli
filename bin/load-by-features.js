#! /usr/bin/env node

var pjson = require('../package.json');
var args = require('minimist')(process.argv.slice(2));
var request = require('superagent');
require('superagent-proxy')(request);
var admZip = require('adm-zip');
var fs = require('fs');
var utils = require('./utils');

console.log("POWO CLI load-by-features Version", pjson.version);

var proxy = args && args.proxy;
var location = args && args.location;

var project = args && args.project;
var country = args && args.country || 'XX';
var platform = args && args.platform;
var version = args && args.version;

location = utils.checkLocationPath(location);
project = utils.checkProjectName(project);

console.log('proxy', proxy);
console.log('location', location);
console.log('project', project);
console.log('country', country);
console.log('platform', platform);
console.log('version', version);

var url = 'https://oss.eu-west-0.prod-cloud-ocb.orange-business.com/powo-prod-dist/' +
    project + '/' + country + '/' + platform + '/' + version + '/Configuration.zip';

if (project && location) {

    var zipFile = location + 'Configuration.zip';

    if (!fs.existsSync(location)) {
        fs.mkdirSync(location, {
            recursive: true
        }, function (err) {
            if (err)
                throw err;
        });
    }

    request
        .get(url)
        .proxy(proxy)
        .on('error', function (error) {
            // console.error(error);
            console.e('Request error');
        })
        .pipe(fs.createWriteStream(zipFile))
        .on('finish', function (e) {
            console.log('finished downloading');
            var zip = new admZip(zipFile);
            console.log('start unzip');
            zip.extractAllTo( /*target path*/ location, /*overwrite*/ true);

            // Remove temp files
            // fs.unlinkSync(location + 'Config.json');
            // fs.unlinkSync(location + 'Configuration.zip');
            if (fs.existsSync(location + 'Config.json')) {
                fs.unlink(location + 'Config.json', function (err) {
                    if (err) throw err;
                    console.log('file Config deleted!');
                });
            }
            if (fs.existsSync(location + 'Configuration.json')) {
                fs.unlink(location + 'Configuration.json', function (err) {
                    if (err) throw err;
                    console.log('file Configuration deleted!');
                });
            }

            console.log('finished unzip');
        });

}