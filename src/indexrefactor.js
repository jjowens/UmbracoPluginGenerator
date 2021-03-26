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

        // CREATE PACKAGE MAINFEST OBJECT
        let pluginManifest = createPackageManifest();
        let pluginManifestFilePath = pluginFolderPath + "/package.manifest";

        // CREATE MANIFEST FILE
        jsonStr = JSON.stringify(pluginManifest, null, 2);
        writeToFile(pluginManifestFilePath, jsonStr);

        let templateFilePath = "";
        let writeFilePath = "";

        // CREATE FILES FROM PLUGIN CONFIG. RESET FIELDS FOR EACH DASHBOARD/VIEW
        if (dashboardFiles !== undefined) {
            dashboardFiles.forEach(fileObj => {
                let fields = [];
                fields.push({name: "##CONTROLLERNAME##", value: fileObj.controllername});

                // CREATE DASHBOARD FILE
                templateFilePath = templateFolderPath + "\\generic\\dashboard-default.html";
                writeFilePath = pluginFolderPath + "\\" + fileObj.view;
                writeContentToFile(writeFilePath, templateFilePath, fields);

                // CREATE CONTROLLER
                templateFilePath = templateFolderPath + "\\generic\\controller-default.js";
                writeFilePath = pluginFolderPath + "\\" + fileObj.controllerfile;
                writeContentToFile(writeFilePath, templateFilePath, fields);

            });
        }

        // CREATE CSS FILES
        if (cssFiles !== undefined) {
            cssFiles.forEach(fileObj => {
                writeToFile(fileObj, "");
            });
        }

        // CREATE LANGUAGE FILE
        let langFilePath = pluginFolderPath + "/lang/en-us.xml";
        templateFilePath = templateFolderPath + "\\" + pluginUmbracoVersion +  "\\lang-file.xml";
        contentFields = [
            { name: "##ALIAS##", value: "en"},
            { name: "##NAME##", value: "English (US)"},
            { name: "##LOCALNAME##", value: "English (US)"},
            { name: "##CULTURE##", value: "en-us"},
            { name: "##PLUGINALIAS##", value: currentPluginConfig.alias},
            { name: "##PLUGINNAME##", value: currentPluginConfig.pluginname}
        ]
        writeContentToFile(langFilePath, templateFilePath, contentFields);

        // UPDATE XML FILES
        if (pluginUmbracoVersion === 7) {
            createUmbraco7Files();
        }
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
        let manifest = {};

        manifest.dashboards = [];
        manifest.javascript = [];

        let dashboard = { };
        let dashboardFilename = "dashboard.html";
        let dashboardWeight = 0;

        if (currentPluginConfig.dashboards === undefined) {
            dashboard = {
                alias: currentPluginConfig.pluginname,
                view: pluginRelativeFolderPath + "/" + dashboardFilename,
                sections: [ currentPluginConfig.pluginname.toLowerCase() ],
                weight: dashboardWeight,
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
            dashboardWeight = 0;
            currentPluginConfig.dashboards.forEach(item => {
                dashboardFilename = item.view;
                viewFilePath = pluginFolderPath + "/" + dashboardFilename;

                dashboard = {
                    alias: currentPluginConfig.pluginname,
                    view: pluginRelativeFolderPath + "/" + dashboardFilename,
                    sections: [ currentPluginConfig.pluginname.toLowerCase() ],
                    weight: dashboardWeight,
                    access: [
                        {"grant": "admin"}
                    ]
                }

                let dashboardFile = {
                    view: dashboardFilename,
                    controllerfile: item.controllerfile,
                    controllername: item.controllername
                }

                let controllerPath = "~" + pluginRelativeFolderPath + "/" + item.controllerfile;
                manifest.javascript.push(controllerPath);

                manifest.dashboards.push(dashboard);
                dashboardFiles.push(dashboardFile);
                dashboardWeight += 1;
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

    function createUmbraco7Files() {
            // DASHBOARD CONFIG. 
            // CREATE TABS DATA
            let tabTemplate = fs.readFileSync(templateFolderPath + "\\7\\dashboard-config-tabs.txt", "utf-8");
            let tabContent = "";

            currentPluginConfig.dashboards.forEach(item => {
                let caption = "Content";
                let dashboardFilePath = pluginRelativeFolderPath + "/" + item.view;

                if (item.caption !== undefined) {
                    caption = item.caption;
                }

                let tempContent = replaceContent(contentFields, tabTemplate);
                tempContent = tempContent.replace("##CAPTION##", caption);
                tempContent = tempContent.replace("##DASHBOARDFILEPATH##", dashboardFilePath);

                tabContent += tempContent + "\r\n";

            });

            // CREATE SECTION
            let sectionTemplate = fs.readFileSync(templateFolderPath + "\\7\\dashboard-config.txt", "utf-8");
            let sectionContent = "";

            sectionContent = replaceContent(contentFields, sectionTemplate);
            sectionContent = sectionContent.replace("##TABS##", tabContent);
            sectionContent = sectionContent.replace("##AREAS##", currentPluginConfig.pluginname.toLowerCase());

            //console.log(tabContent);
            console.log(sectionContent);

            // APPLICATIONS CONFIG
            // CREATE APPLICATION LINE
            let applicationTemplate = fs.readFileSync(templateFolderPath + "\\7\\applications-config.txt", "utf-8");
            let applicationContent = "";
            let sortOrder = 10;
            let trayIcon = "traydeveloper";

            applicationContent = replaceContent(contentFields, applicationTemplate);
            applicationContent = applicationContent.replace("##SORTORDER##", sortOrder);
            applicationContent = applicationContent.replace("##ICON##", trayIcon);

            console.log(applicationContent);

    }


    return {
        GeneratePlugin: GeneratePlugin
    }

}();

module.exports.UmbracoPluginGenerator = exports = myNamespace;