## Deploying to your own development environment

Set up AWS credentials/profiles as described in root README.

1. Create an environment JSON file in deploymentScripts>environmentConfig - Copy the format of what is inside the folder currently, prepend username to the filename also
2. Install packages in the platform directory with `npm i`
3. Deploy to personal developer environment in AWS running the command below: **Remember to change the environment name to your own**
    > `npm run deploy -- --environment ${env-name} --profile ${profile} --platformProfile ${platformProfile}`
    > Eg: `npm run deploy -- --environment cameront --profile cdv --platformProfile cdv`