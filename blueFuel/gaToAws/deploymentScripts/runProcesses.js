const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const path = require('path');

module.exports = {
    runCmd: function(cmd, parameters, verbose = false, cwd = undefined, environmentVariables = undefined) {

        const isWindows = /win32/.test(process.platform);

        let executableCmd = cmd;
        let executableCmdParams = parameters;
        if (isWindows) {
            if (!executableCmdParams) {
                executableCmdParams = [];
            } else {
                executableCmdParams = parameters.slice();
            }
            executableCmdParams.unshift(cmd);
            executableCmdParams.unshift('/c');
            executableCmd = process.env.comspec;
        }

        return new Promise((resolve, reject) => {
            let options = {};
            if (cwd) {
                options['cwd'] = path.resolve(cwd);
            }
            let output = '';
            let errOutput = '';
            const spawnedProcess = spawn(executableCmd, executableCmdParams, options);
            spawnedProcess.stdout.on('data', (data) => {
                if (verbose) {
                    console.log(data.toString());
                }
                output += data.toString();
            });
            spawnedProcess.stderr.on('data', (data) => {
                errOutput += data.toString();
            });
            spawnedProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(errOutput);
                }
                resolve(output);
            });
            spawnedProcess.on('error', (error) => {
                console.log(error);
                reject(error.toString());
            });
        });
    }
};
