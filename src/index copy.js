const fs = require('fs');
module.exports.UmbracoPluginGenerator = UmbracoPluginGenerator;

function UmbracoPluginGenerator(pluginConfig) {
    console.log({pluginConfig});

    let fileName = "/data.test.json";
    let filePath = pluginConfig.projectpath + fileName; 
    let jsonStr = JSON.stringify(pluginConfig);

    fs.writeFile(filePath, jsonStr, function (err) {
        if (err) return console.log(err);
        console.log('Exported Data');
      });

      
}