const fs = require('fs');
const path = require('path');

module.exports = {
    loadConfig: function(environment) {
        const configPath = path.join(__dirname, `./environmentConfig/${environment}.json`);
        if (!fs.existsSync(configPath)) {
            throw new Error(`No config found at ${configPath}`)
        }
        const configFileContent = fs.readFileSync(configPath);
        const existingConfig = JSON.parse(configFileContent);
        return existingConfig;
    }
};
