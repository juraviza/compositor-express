import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  return {
    bucketName: process.env.B2_BUCKET_NAME ?? '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX ?? '',
  };
}

export function createS3Client() {
  const config: S3ClientConfig = {
    region: process.env.B2_REGION || 'us-west-002',
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-002.backblazeb2.com',
    credentials: {
      accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
    },
    // Force path style for B2
    forcePathStyle: true,
  };
  return new S3Client(config);
}
