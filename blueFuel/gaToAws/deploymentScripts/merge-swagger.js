const runCmd = require('./runProcesses').runCmd;
const args = require('minimist')(process.argv.slice(2));
const verbose = args.verbose || false;
const mergeSwaggerFiles = async (inputFileName, outputFileName) => {
    if (!inputFileName) {
        throw Error("Input param missing");
    }

    if (!outputFileName) {
        throw Error("Output param missing");
    }

    const isWindows = /win32/.test(process.platform);
    // Validate and combine swagger ref files into single yaml

    const uploadCommandParams = ['bundle', inputFileName, '-o', `${outputFileName}`, '-t', 'yaml'];
    const command = !isWindows ? './node_modules/.bin/swagger-cli' : './node_modules/.bin/swagger-cli.cmd ';
    console.log('RUNNING:' + command + ' ' + uploadCommandParams.join(' '));
    await runCmd(command, uploadCommandParams, verbose);
    console.log(`Merged swagger reference files into ${outputFileName}`);
};
module.exports.mergeSwaggerFiles = mergeSwaggerFiles;
