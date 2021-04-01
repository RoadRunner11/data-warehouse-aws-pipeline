const runCmd = require('./runProcesses').runCmd;
const loadConfig = require('./loadDeploymentConfig').loadConfig;
const args = require('minimist')(process.argv.slice(2));

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

const CloudFormationReader = require('./cloudFormationReader');

const gaFirehoseS3BucketKey = 'FirehoseBucket';
const lakeFormationS3AccessRoleArnOutputKey = 'LakeFormationS3AccessRoleArn';

const platformDataLakeStackName = `cdv-platform-datalake-${environment}`;
const dataLakeStackName = `cdv-data-lake-bf-${environment}`;
const gaToAwsStackName = `cdv-bf-ga-to-aws-${environment}`;

if (!environment) {
    throw new Error('No environment has been specified. Use --environment to specify one.');
}

if (!platformProfile) {
    throw new Error('No platformProfile has been specified. Use --platformProfile to specify one');
}

async function getPlatformDataLakeStackConfig(platformProfile) {
    const platformCfReader = new CloudFormationReader(platformProfile);
    const datalakeStackOutputs = await platformCfReader.getStackOutputs(platformDataLakeStackName);

    if (!datalakeStackOutputs[lakeFormationS3AccessRoleArnOutputKey]) {
        throw new Error(`Error getting platform data lake stack config. Has the platform data lake been deployed?`);
    }

    return {
        lakeFormationS3AccessRoleArn: datalakeStackOutputs[lakeFormationS3AccessRoleArnOutputKey]
    } 
}

async function getGaToAwsStackOutputs() {
    const productCfReader = new CloudFormationReader(profile);
    const gaToAwsStackOutputs = await productCfReader.getStackOutputs(gaToAwsStackName, region);

    if (!gaToAwsStackOutputs[gaFirehoseS3BucketKey]) {
        throw new Error(`Error getting GAtoAWS stack config. Has the GaToAWS stack been deployed?`);
    }

    return {
        firehoseS3Bucket: gaToAwsStackOutputs[gaFirehoseS3BucketKey]
    } 
}

const deployDataLake = async (deploymentConfig) => {

    const platformDataLakeStackOutputs = await getPlatformDataLakeStackConfig(platformProfile);
    const gaToAwsStackOutputs = await getGaToAwsStackOutputs();

    const deployCommandParams = [
        'deploy',
        '--template-file', `./template-data-lake.inc.yaml`,
        '--stack-name', dataLakeStackName,
        '--capabilities', 'CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND',
        '--s3-bucket', deploymentConfig.deploymentS3BucketName,
        '--s3-prefix', deploymentConfig.deploymentFolderInS3,
        '--no-fail-on-empty-changeset',
        '--parameter-overrides',
        `Environment=${environment}`,
        `LakeFormationS3AccessRoleArn=${platformDataLakeStackOutputs.lakeFormationS3AccessRoleArn}`,
        `GALegacyFirehoseBucket=${gaToAwsStackOutputs.firehoseS3Bucket}`,
        `DeploymentBucketName=${deploymentConfig.deploymentS3BucketName}`,
        `DeploymentBucketPrefix=${deploymentConfig.deploymentFolderInS3}`
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

(async () => {
    try {
        const deploymentConfig = loadConfig(environment);

        console.log(`[${OK}] Deploying Data Lake to region ${region ? region.yellow : 'not specified'}`);
        await deployDataLake(deploymentConfig);
    }
    catch (error) {
        console.log(`[${ERR}] The following error was thrown during deployment \n`, error);
        process.exitCode = 1;
    }
})();