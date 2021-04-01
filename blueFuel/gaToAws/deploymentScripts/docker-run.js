const args = require('minimist')(process.argv.slice(2));
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const dockerRun = async (file, port) => {
    if (!port) {
        throw Error("port param missing");
    }

    const currentDir = process.cwd();
    const params = [
        'docker',
        'run',
        '-p',
        `${port}:8080`,
        '-e',
        `SWAGGER_JSON=${file}`,
        '-v',
        `"${currentDir}/swagger-ui:/swagger-ui"`,
        'swaggerapi/swagger-ui'
    ];

    console.log(`Launch docker container for swagger-ui on http://localhost:${port}`);
    const { stdout, stderr } = await exec(params.join(' '));
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
};

(async () => {
    try {
        if (!args.port) {
            throw Error("Missing port argument (eg --port=4201)");
        }
        if (!args.file) {
            throw Error("Missing file argument (eg --file=/swagger-ui/api/openapi.json")
        }

        await dockerRun(args.file, args.port);
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
    }
})();

