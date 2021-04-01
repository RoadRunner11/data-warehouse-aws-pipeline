# Data Lake Infrastructure
There are separate stacks for each product and one shared stack ('platform'). The deployment process for each stack is fairly similar.

## Summary of directories & stacks

Each stack can be deployed by changing to the relevant directory and following the deployment instructions below.

| Path              | Cloudformation Stack Description                                                                 |
|-------------------|--------------------------------------------------------------------------------------------------|
| /bluefuel         | Bluefuel data lake buckets & infrastructure to copy GA data to landing                           |
| /bluefuel/gaToAws | Separate stack used by bluefuel website to get GA data into AWS                                  |
| /footwork         | Footwork data lake buckets                                                                       |
| /perfectPlay      | Perfect play data lake buckets                                                                   |
| /platform         | Shared infrastructure to grant central AWS account access to data lake buckets via LakeFormation |

## AWS Accounts

### Dev accounts
The product stacks and the platform stack are all deployed to one development account.

### Live accounts
The product stacks are deployed to their respective product's AWS accounts. The platform stack is deployed to the shared platform AWS account.

### Packages and tools used
-   AWS CLI
-   AWS Sam CLI (v0.47.0)
-   Node.js

## Prerequisites
- AWS Sam IAM credentials.

### Setting up AWS Credentials
-   Create a profile in your AWS credentials called 'cdv'
-   Use the command `aws configure --profile cdv`
-   When using the above command, be sure you have access to credentials
-   Use access key id and secret id sent from aws administrator 
-   Set region name to eu-west-1

For deploying to staging/live you will need to create an AWS profile in your AWS credentials file for the shared platform account for the environment. For dev/qa/demo the platform account is the same as the dev account so this is not neccesary.

```
[cdv-bf-live]
role_arn=arn:aws:iam::${AccountNumber}:role/OrganizationAccountAccessRole
source_profile=cdv
region=eu-west-1
```

## Deploying to your own development environment

This process must be done for each of the platform stacks and the platform stack.

1. `cd` in to relevant folder (eg `cd blueFuel`).
2. Create an environment JSON file in deploymentScripts>environmentConfig - Copy the format of what is inside the folder currently, prepend username to the filename also
3. Install packages in the platform directory with `npm i`
4. (Optional - depends on stack. See individual READMEs) `npm run build`
5. Deploy to personal developer environment in AWS running the command below: **Remember to change the environment name to your own**
    > `npm run deploy -- --environment ${env-name} --profile ${profile} --platformProfile ${profile}`
    > Eg: `npm run deploy -- --environment cameront --profile cdv --platformProfile cdv`