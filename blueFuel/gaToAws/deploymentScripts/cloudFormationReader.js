const runCmd = require('./runProcesses').runCmd;

module.exports = class CloudFormationReader {

    constructor(awsProfile) {
        this.awsProfile = awsProfile;
    }

    readFromAws(stackName, region) {
        const cmdParams = ['cloudformation', 'list-stack-resources', '--stack-name', stackName];
        if (this.awsProfile) {
            cmdParams.push('--profile', this.awsProfile);
        }
        if (region) {
            cmdParams.push('--region', region);
        }
        
        return runCmd('aws', cmdParams)
        .then((output) => {
            let data = JSON.parse(output)["StackResourceSummaries"];
            let resourceIdMap = data.reduce((map, resource) => {
                map[resource["LogicalResourceId"]] = resource["PhysicalResourceId"];
                return map
            }, {});
            return resourceIdMap;
        });        
    }
};
