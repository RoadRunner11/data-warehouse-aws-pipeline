import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { CopyObjectRequest } from 'aws-sdk/clients/s3';

const s3Client = new AWS.S3();

const destinationBucketName = process.env.destinationBucketName;
if (!destinationBucketName) {
    throw new Error('Missing destinationBucketName environment variable');
}

const sourceKeyPrefix = process.env.sourceKeyPrefix;
if (!sourceKeyPrefix) {
    throw new Error('Missing sourceKeyPrefix environment variable');
}

const destinationKeyPrefix = process.env.destinationKeyPrefix;
if (!destinationKeyPrefix) {
    throw new Error('Missing destinationKeyPrefix environment variable');
}

const copyItemToLegacyBucket = async (sourceBucket: string, key: string) => {
    const destinationKey = key.replace(sourceKeyPrefix, destinationKeyPrefix);
    console.log(`Copying from: ${sourceBucket + '/' + key} to ${destinationBucketName + '/' + destinationKey}`);

    const params: CopyObjectRequest = {
        Bucket: destinationBucketName,
        Key: destinationKey,
        CopySource: sourceBucket + '/' + key
    };

    return s3Client.copyObject(params).promise();
};

export const handler = async (event: S3Event) => {
    const promises = event.Records.map(s3Record => {
        const bucket = s3Record.s3.bucket.name;
        const key = decodeURIComponent(s3Record.s3.object.key);

        return copyItemToLegacyBucket(bucket, key);
    });

    await Promise.all(promises);
};
