const fs = require('fs');

var myNamespace = function UmbracoPluginGenerator() {
    
    function GeneratePlugin(pluginConfig) {
        console.log({pluginConfig});

        let fileName = "/data.test.json";
        let filePath = pluginConfig.projectpath + fileName; 
        let jsonStr = JSON.stringify(pluginConfig);

        writeToFile(filePath, jsonStr);


        

    }

    function writeToFile(filePath, data) {
        fs.writeFile(filePath, data, function (err) {
            if (err) return console.log(err);
            console.log('Generic Exported Data');
        });
    }

    return {
        GeneratePlugin: GeneratePlugin
    }

}();

module.exports.UmbracoPluginGenerator = exports = myNamespace;