const runCmd = require('./runProcesses').runCmd;
const loadConfig = require('./loadDeploymentConfig').loadConfig;
const args = require('minimist')(process.argv.slice(2));

const CloudFormationReader = require('./cloudFormationReader');
var colors = require('colors');
const OK = 'OK'.green;
const ERR = 'ERR'.red;
const TRACE = 'TRACE'.yellow;
const INFO = 'INFO'.yellow;

const environment = args.environment;
const profile = args.profile;
const platformProfile = args.platformProfile;
const region = args.region;
const verbose = args.verbose || false;

if (!environment) {
    throw new Error('No environment has been specified. Use --environment to specify one.');
}

if (!platformProfile) {
    throw new Error('No platform profile specified. Use --platformProfile to specify one');
}

const lakeFormationS3AccessRoleArnOutputKey = 'LakeFormationS3AccessRoleArn';

const dataLakeCoreStackName = `cdv-data-lake-pp-${environment}`;
const platformDataLakeStackName = `cdv-platform-datalake-${environment}`;

const deployDataLake = async (deploymentConfig) => {

    const platformDataLakeStackOutputs = await getPlatformDataLakeStackConfig(platformProfile);

    const deployCommandParams = [
        'deploy',
        '--template-file', `./template-data-lake.inc.yaml`,
        '--stack-name', dataLakeCoreStackName,
        '--capabilities', 'CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND',
        '--s3-bucket', deploymentConfig.deploymentS3BucketName,
        '--s3-prefix', deploymentConfig.deploymentFolderInS3,
        '--no-fail-on-empty-changeset',
        '--parameter-overrides',
        `Environment=${environment}`,
        `LakeFormationS3AccessRoleArn=${platformDataLakeStackOutputs.lakeFormationS3AccessRoleArn}`,
    ];
    
    deployCommandParams.push('--profile', profile);

    if (region) {
        deployCommandParams.push('--region', region);
    }

    if (verbose !== false) {
        console.log(`[${TRACE}] CMD => sam `, deployCommandParams.join(' '));
    }

    await runCmd('sam', deployCommandParams, verbose);

    console.log(`[${OK}] Data Lake deployment complete`);
};

async function getPlatformDataLakeStackConfig(platformProfile) {
    const platformCfReader = new CloudFormationReader(platformProfile);
    const datalakeStackOutputs = await platformCfReader.getStackOutputs(platformDataLakeStackName, region);

    if (!datalakeStackOutputs[lakeFormationS3AccessRoleArnOutputKey]) {
        throw new Error(`Error getting platform data lake stack config. Has the platform data lake been deployed?`);
    }

    return {
        lakeFormationS3AccessRoleArn: datalakeStackOutputs[lakeFormationS3AccessRoleArnOutputKey]
    } 
}

(async () => {
    try {
        const deploymentConfig = loadConfig(environment);

        console.log(`\n[${INFO}] Deploy data lake to region ${region ? region.yellow : 'not specified'}`);
        await deployDataLake(deploymentConfig);
    }
    catch (error) {
        console.log(`[${ERR}] The following error was thrown during deployment \n`, error);
        process.exitCode = 1;
    }
})();