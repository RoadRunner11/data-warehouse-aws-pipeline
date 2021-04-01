const runCmd = require('./runProcesses').runCmd;
const args = require('minimist')(process.argv.slice(2));
const v4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');

const environment = args.environment;
const profile = args.profile;
const verbose = args.verbose || false;


if (!environment) {
    throw new Error('No environment has been specified. Use --environment to specify one.');
}

(async () => {
    try {
        // Create bucket
        const uniqueId = v4(); // generate unique id to prevent bucket hijacking
        const s3BucketName = `cdv-deployment-${environment}-${uniqueId}`;
        const packageCommandParams = [ 's3', 'mb', `s3://${s3BucketName}` ];
        if (profile) {
            packageCommandParams.push('--profile', profile);
        }
        await runCmd('aws', packageCommandParams, verbose);
        console.log('Deployment S3 bucket created');
        
        const uniqueIdForFolder = v4();
        const deploymentConfig = {
            deploymentS3BucketName: s3BucketName,
            deploymentFolderInS3: `${environment}-${uniqueIdForFolder}`
        };
        const configPath = path.join(__dirname, `./environmentConfig/${environment}.json`);
        writeDeploymentConfig(configPath, deploymentConfig)
        console.log(`Config file created at ${configPath}`);
    }
    catch (error) {
        console.log(error);
        process.exitCode = 1;
    }
})();

function writeDeploymentConfig(deploymentConfigDestination, config) {
    if (!deploymentConfigDestination || !config) {
        throw new Error('Deployment config destination and config both need to be provided.')
    }
    if (fs.existsSync(deploymentConfigDestination)) {
        const configFileContent = fs.readFileSync(deploymentConfigDestination);
        const existingConfig = JSON.parse(configFileContent);
        const newConfig = {
            ...existingConfig,
            ...config
        };
        config = newConfig;
    }
    fs.writeFileSync(deploymentConfigDestination, JSON.stringify(config, undefined, 2));
}