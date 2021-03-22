const fs = require('fs');

var myNamespace = function UmbracoPluginGenerator() {
    
    let pluginUmbracoVersion = 7;
    let currentPluginConfig = {};
    let pluginFolderPath = "";
    let pluginRelativeFolderPath = "";

    function GeneratePlugin(pluginConfig) {
        currentPluginConfig = pluginConfig;

        let fileName = "/data.test.json";
        let filePath = pluginConfig.projectpath + fileName; 
        let jsonStr = JSON.stringify(currentPluginConfig);

        writeToFile(filePath, jsonStr);

        let pluginName =  pluginConfig.pluginname;

        pluginFolderPath = pluginConfig.projectpath + "/App_Plugins/" + pluginName;
        pluginRelativeFolderPath = "/App_Plugins/" + pluginName;
        createFolder(pluginFolderPath);

        // CREATE PACKAGE MAINFEST
        let pluginManifest = createPackageManifest();
        let pluginManifestFilePath = pluginFolderPath + "/package.manifest";

        jsonStr = JSON.stringify(pluginManifest, null, 2);
        writeToFile(pluginManifestFilePath, jsonStr);
    }

    function writeToFile(filePath, data) {
        fs.writeFile(filePath, data, function (err) {
            if (err) return console.log(err);
        });
    }

    function createFolder(folderPath) {
        try {
            // first check if directory already exists
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

        let dashboard = {
            alias: currentPluginConfig.pluginname,
            view: pluginRelativeFolderPath + "/" + "Dashboard.html",
            sections: [ currentPluginConfig.pluginname.toLowerCase() ],
            weight: 0,
            access: [
                {"grant": "admin"}
            ]
        }

        manifest.dashboards.push(dashboard);

        manifest.javascript = [];
        manifest.css = [];

        return manifest;
    }


    return {
        GeneratePlugin: GeneratePlugin
    }

}();

module.exports.UmbracoPluginGenerator = exports = myNamespace;