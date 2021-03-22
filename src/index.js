const fs = require('fs');
const path = require('path');

var myNamespace = function UmbracoPluginGenerator() {
    
    let pluginUmbracoVersion = 7;
    let currentPluginConfig = {};
    let pluginFolderPath = "";
    let pluginRelativeFolderPath = "";
    let dashboardFiles = [];
    let controllerFiles = [];
    let cssFiles = [];

    function GeneratePlugin(pluginConfig) {
        currentPluginConfig = pluginConfig;

        let pluginName =  pluginConfig.pluginname;

        pluginFolderPath = pluginConfig.projectpath + "/App_Plugins/" + pluginName;
        pluginRelativeFolderPath = "/App_Plugins/" + pluginName;
        createFolder(pluginFolderPath);

        // CREATE PACKAGE MAINFEST
        let pluginManifest = createPackageManifest();
        let pluginManifestFilePath = pluginFolderPath + "/package.manifest";

        // CREATE MANIFEST FILE
        jsonStr = JSON.stringify(pluginManifest, null, 2);
        writeToFile(pluginManifestFilePath, jsonStr);

        // CREATE FILES BASED ON MANIFEST
        if (dashboardFiles !== undefined) {
            dashboardFiles.forEach(element => {
                writeToFile(element, "");
            });
        }

        if (controllerFiles !== undefined) {
            controllerFiles.forEach(element => {
                writeToFile(element, "");
            });
        }

        if (cssFiles !== undefined) {
            cssFiles.forEach(element => {
                writeToFile(element, "");
            });
        }
        
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

    function createPackageManifest() {
        let manifest = {};

        manifest.dashboards = [];

        let dashboard = { };
        let dashboardFilename = "Dashboard.html";
        let viewFilePath = pluginFolderPath + "/" + dashboardFilename;

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

            manifest.dashboards.push(dashboard);
            dashboardFiles.push(viewFilePath);
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
                manifest.dashboards.push(viewFilePath);
                dashboardFiles.push(viewFilePath);
            });

        }

        if (currentPluginConfig.controllers !== undefined) {
            manifest.javascript = [];

            currentPluginConfig.controllers.forEach(item => {
                let relativePath = pluginFolderPath + "/" + item;
                let controllerPath = "~" + pluginRelativeFolderPath + "/" + item;

                manifest.javascript.push(controllerPath);
                controllerFiles.push(relativePath);
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