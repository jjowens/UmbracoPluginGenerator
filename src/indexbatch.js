const fs = require('fs');
const path = require('path');

var myNamespace = function UmbracoPluginGenerator() {
    
    let pluginUmbracoVersion = 7;
    let currentPluginConfig = {};
    let pluginFolderPath = "";
    let pluginRelativeFolderPath = "";
    let batchFiles = [];
    let templateFolderPath = "";
    let contentFields = [];

    function GeneratePlugin(pluginConfig) {
        currentPluginConfig = pluginConfig;
        templateFolderPath = __dirname + "\\template";
        
        if (currentPluginConfig.alias === undefined) {
            currentPluginConfig.alias = currentPluginConfig.pluginname.toLowerCase().trim();
        }

        // FIND 
        pluginFolderPath = currentPluginConfig.projectpath + "/App_Plugins/" + currentPluginConfig.pluginname;
        pluginRelativeFolderPath = "/App_Plugins/" + currentPluginConfig.pluginname;
        createFolder(pluginFolderPath);
        
    }

    function writeToFile(filePath, data) {
        var folderPath = path.dirname(filePath);

        createFolder(folderPath);

        fs.writeFile(filePath, data, function (err) {
            if (err) return console.log(err);
        });
    }

    function writeContentToFile(filePath, templateFilePath, fields) {
        let content = "";
        var folderPath = path.dirname(filePath);

        createFolder(folderPath);

        if (templateFolderPath !== undefined || templateFolderPath !== "") {
            content = fs.readFileSync(templateFilePath, "utf-8");
        }

        if (fields !== undefined) {
            if (fields.length > 0) {
                content = replaceContent(fields, content);
            }
        }

        fs.writeFile(filePath, content, function (err) {
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
        
    } 

    return {
        GeneratePlugin: GeneratePlugin
    }

}();

module.exports.UmbracoPluginGenerator = exports = myNamespace;