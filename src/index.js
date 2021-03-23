const fs = require('fs');
const path = require('path');

var myNamespace = function UmbracoPluginGenerator() {
    
    let pluginUmbracoVersion = 7;
    let currentPluginConfig = {};
    let pluginFolderPath = "";
    let pluginRelativeFolderPath = "";
    let dashboardFiles = [];
    let cssFiles = [];
    let templateFolderPath = "";

    function GeneratePlugin(pluginConfig) {
        currentPluginConfig = pluginConfig;
        templateFolderPath = __dirname + "\\template";
        
        if (currentPluginConfig.alias === undefined) {
            currentPluginConfig.alias = currentPluginConfig.pluginname.toLowerCase().trim();
        }

        pluginFolderPath = currentPluginConfig.projectpath + "/App_Plugins/" + currentPluginConfig.pluginname;
        pluginRelativeFolderPath = "/App_Plugins/" + currentPluginConfig.pluginname;
        createFolder(pluginFolderPath);

        // CREATE PACKAGE MAINFEST
        let pluginManifest = createPackageManifest();
        let pluginManifestFilePath = pluginFolderPath + "/package.manifest";

        // CREATE MANIFEST FILE
        jsonStr = JSON.stringify(pluginManifest, null, 2);
        writeToFile(pluginManifestFilePath, jsonStr);

        let fields = [];
        let tempFileContents = "";
        let readFilePath = "";

        // CREATE FILES BASED ON MANIFEST
        if (dashboardFiles !== undefined) {
            dashboardFiles.forEach(fileObj => {
                fields = [];
                fields.push({name: "##CONTROLLERNAME##", value: fileObj.controllername});

                // CREATE DASHBOARD FILE
                readFilePath = templateFolderPath + "\\" + pluginUmbracoVersion + "\\dashboard-default.html";
                tempFileContents = fs.readFileSync(readFilePath, "utf-8");
                tempFileContents = replaceContent(fields, tempFileContents);

                let writeFilePath = pluginFolderPath + "\\" + fileObj.view;
                writeToFile(writeFilePath, tempFileContents);

                // CREATE CONTROLLER
                readFilePath = templateFolderPath + "\\" + pluginUmbracoVersion + "\\controller-default.js";
                tempFileContents = fs.readFileSync(readFilePath, "utf-8");
                tempFileContents = replaceContent(fields, tempFileContents);

                writeFilePath = pluginFolderPath + "\\" + fileObj.controllerfile;
                writeToFile(writeFilePath, tempFileContents);
            });
        }

        // create css files
        if (cssFiles !== undefined) {
            cssFiles.forEach(fileObj => {
                writeToFile(fileObj, "");
            });
        }

        // CREATE LANGUAGE FILE
        let langObj = {
            alias: "en",
            name: "English (US)",
            localname: "English (US)",
            culture: "en-us"
        }

        let langContents = fs.readFileSync(templateFolderPath + "\\" + pluginUmbracoVersion +  "\\lang-file.xml", "utf-8");

        fields = [
            { name: "##ALIAS##", value: langObj.alias},
            { name: "##NAME##", value: langObj.name},
            { name: "##LOCALNAME##", value: langObj.localname},
            { name: "##CULTURE##", value: langObj.culture},
            { name: "##PLUGINALIAS##", value: currentPluginConfig.alias},
            { name: "##PLUGINNAME##", value: currentPluginConfig.pluginname}
        ]

        langContents = replaceContent(fields, langContents);

        let langFilePath = pluginFolderPath + "/lang/" + langObj.culture + ".xml";

        writeToFile(langFilePath, langContents);

    }

    function writeToFile(filePath, data) {
        var folderPath = path.dirname(filePath);

        createFolder(folderPath);

        fs.writeFile(filePath, data, function (err) {
            if (err) return console.log(err);
        });
    }

    function createFolder(folderPath) {
        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        } catch (err) {
            console.log(err);
        }
    }

    function replaceContent(fields, data) {

        fields.forEach(field => {
            data = data.replace(field.name, field.value);
        });

        return data;
    }

    function createPackageManifest() {
        let manifest = {};

        manifest.dashboards = [];
        manifest.javascript = [];

        let dashboard = { };
        let dashboardFilename = "dashboard.html";

        if (currentPluginConfig.dashboards === undefined) {
            dashboard = {
                alias: currentPluginConfig.pluginname,
                view: pluginRelativeFolderPath + "/" + dashboardFilename,
                sections: [ currentPluginConfig.pluginname.toLowerCase() ],
                weight: 0,
                access: [
                    {"grant": "admin"}
                ]
            }

            let defaultDashboard = {
                view: dashboardFilename,
                controllerfile: "default.js",
                controllername: "My." + currentPluginConfig.pluginname + "Controller"
            }

            let controllerPath = "~" + pluginRelativeFolderPath + "/" + defaultDashboard.controllerfile;
            manifest.javascript.push(controllerPath);

            manifest.dashboards.push(dashboard);
            dashboardFiles.push(defaultDashboard);
            
        } else {
            currentPluginConfig.dashboards.forEach(item => {
                dashboardFilename = item.view;
                viewFilePath = pluginFolderPath + "/" + dashboardFilename;

                dashboard = {
                    alias: currentPluginConfig.pluginname,
                    view: pluginRelativeFolderPath + "/" + dashboardFilename,
                    sections: [ currentPluginConfig.pluginname.toLowerCase() ],
                    weight: item.weight,
                    access: [
                        {"grant": "admin"}
                    ]
                }

                let dashboardFile = {
                    view: dashboardFilename,
                    controllerfile: "default.js",
                    controllername: "My." + currentPluginConfig.pluginname + "Controller"
                }

                let controllerPath = "~" + pluginRelativeFolderPath + "/" + item.controllerfile;
                manifest.javascript.push(controllerPath);

                manifest.dashboards.push(dashboard);
                dashboardFiles.push(dashboardFile);
            });

        }

        if (currentPluginConfig.css !== undefined) {
            manifest.css = [];

            currentPluginConfig.css.forEach(item => {
                let relativePath = pluginFolderPath + "/" + item;
                let cssPath = "~" + pluginRelativeFolderPath + "/" + item;

                manifest.css.push(cssPath);
                cssFiles.push(relativePath);
            });

        }

        return manifest;
    }


    return {
        GeneratePlugin: GeneratePlugin
    }

}();

module.exports.UmbracoPluginGenerator = exports = myNamespace;