# Data Lake Platform
This stack provides the central account access to the S3 buckets belonging to each product account via LakeFormation.

### Packages and tools used
-   AWS CLI
-   AWS Sam CLI (v0.47.0)
-   Node.js

## Prerequisites
 
- AWS Sam IAM credentials.

### Creating a CDV AWS credentials profile

-   Inside terminal
-   Use the command `aws configure --profile cdv`
-   When using the above command, be sure you have access to credentials
-   Use access key id and secret id sent from aws administrator 
-   Set region name to eu-west-1

## Deploying to your own development environment

1. Create an environment JSON file in deploymentScripts>environmentConfig - Copy the format of what is inside the folder currently, prepend username to the filename also
2. Install packages in the platform directory with `npm i`
3. Deploy to personal developer environment in AWS running the command below: **Remember to change the environment name to your own**
    > `npm run deploy -- --environment ${env-name} --profile ${profile}`
    > Eg: `npm run deploy -- --environment cameront --profile cdv`