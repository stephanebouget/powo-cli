# powo-cli

Node module to import Powo tranlsation into your web project.

## Installation
### Using Yarn
```
yarn add powo-cli
```
### Using Npm
```
npm install powo-cli
```

## How to use
Add load-locales script into your package.json file
```
    "scripts": {
        "powo": "load-locales --project=MyPowoProject --country=XX --platform=web --version=last --languages=fr,en --location=src/locales/"
    }
```
This script will generate en.json and fr.json files with last approved translations into your src/locales/ development path

## Options

| Option                     | Description                                                                       | is Mandatory  |
| -------------------------- |:---------------------------------------------------------------------------------:| -------------:|
| project                    | Powo Project's name                                                               | true          |
| country                    | Country code (default: XX)                                                        | false         |
| platform                   | project's platform (Android, iOS, web, robot)                                     | true          |
| version                    | last or draft                                                                     | true          |
| languages                  | languages to generate                                                             | true          |
| location                   | Destination folder location                                                       | true          |
| proxy                      | Optional proxy. Format : --proxy=http://proxy.fr:8080                             | false         |
