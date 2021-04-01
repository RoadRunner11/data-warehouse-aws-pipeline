const CloudFormationReader = require('./cloudFormationReader');
const mergeSwaggerFiles = require('./merge-swagger').mergeSwaggerFiles;
const loadConfig = require('./loadDeploymentConfig').loadConfig;
const runCmd = require('./runProcesses').runCmd;
const args = require('minimist')(process.argv.slice(2));
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var colors = require('colors');
const OK = 'OK'.green;
const ERR = 'ERR'.red;
const INFO = 'INFO'.yellow;

const environment = args.environment;
const profile = args.profile;
const verbose = args.verbose || false;

const resourceName = 'cdv-bf-ga-to-aws';
const stackName = `${resourceName}-${environment}`;

if (!environment) {
    throw new Error('No environment has been specified. Use --environment to specify one.');
}

(async () => {

    try {
        console.log(`Loading config for ${environment}`);
        const deploymentConfig = loadConfig(environment);

        const deployCommandParams = [
            'deploy',
            '--template-file', './cloudformation/main.yaml',
            '--stack-name', stackName,
            '--capabilities', 'CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND',
            '--s3-bucket', deploymentConfig.deploymentS3BucketName,
            '--s3-prefix', deploymentConfig.deploymentFolderInS3,
            '--parameter-overrides',
            `Name=${resourceName}`,
            `Stage=${environment}`,
            '--no-fail-on-empty-changeset' ];
        if (profile) {
            deployCommandParams.push('--profile', profile);
        }
        await runCmd('sam', deployCommandParams, verbose);
        console.log(`[${OK}] SAM deployment complete`);    
    }
    catch (error) {
        console.log(`[${ERR}] The following error was thrown during deployment ${error}`);
        process.exitCode = 1;
    }
    
})();