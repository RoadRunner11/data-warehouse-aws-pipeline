const runCmd = require('./runProcesses').runCmd;
const loadConfig = require('./loadDeploymentConfig').loadConfig;
const args = require('minimist')(process.argv.slice(2));

const environment = args.environment;
const region = args.region;
const profile = args.profile;
const verbose = args.verbose || false;

const stackName = `cdv-platform-datalake-${environment}`;

// BlueFuel
const blueFuelRawBucketName = `cdv-datalake-raw-bf-${environment}`;
const blueFuelSensitiveBucketName = `cdv-datalake-sensitive-bf-${environment}`;

// Perfect Play
const perfectPlayRawBucketName = `cdv-datalake-raw-pp-${environment}`;
const perfectPlaySensitiveBucketName = `cdv-datalake-sensitive-pp-${environment}`;

// Footworks
const footworksRawBucketName = `cdv-datalake-raw-fw-${environment}`;
const footworksSensitiveBucketName = `cdv-datalake-sensitive-fw-${environment}`;

if (!environment) {
    throw new Error('No environment has been specified. Use --environment to specify one.');
}

if (!profile) {
    throw new Error('No profile has been specified. Use --profile to specify one.');
}

(async () => {
    try {
        console.log(`Deploying Data Lake stack`);

        const deploymentConfig = loadConfig(environment);

        const deployCommandParams = [
            'deploy',
            '--template-file', './template-data-lake.inc.yaml',
            '--stack-name', stackName,
            '--capabilities', 'CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM',
            '--s3-bucket', deploymentConfig.deploymentS3BucketName,
            '--s3-prefix', deploymentConfig.deploymentFolderInS3,
            '--parameter-overrides',
            `Environment=${environment}`,
            `BlueFuelRawBucketName=${blueFuelRawBucketName}`,
            `BlueFuelSensitiveBucketName=${blueFuelSensitiveBucketName}`,
            `PerfectPlayRawBucketName=${perfectPlayRawBucketName}`,
            `PerfectPlaySensitiveBucketName=${perfectPlaySensitiveBucketName}`,
            `FootworksRawBucketName=${footworksRawBucketName}`,
            `FootworksSensitiveBucketName=${footworksSensitiveBucketName}`,
            '--no-fail-on-empty-changeset'
        ];
        if (profile) {
            deployCommandParams.push('--profile', profile);
        }
        if (region) {
            deployCommandParams.push('--region', region);
        }
        await runCmd('sam', deployCommandParams, verbose);
        console.log('SAM deployment complete');

        console.log('Data Lake deployment complete');
    }
    catch (error) {
        console.log(error);
        process.exitCode = 1;
    }
})();
