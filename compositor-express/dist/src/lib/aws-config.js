"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketConfig = getBucketConfig;
exports.createS3Client = createS3Client;
const client_s3_1 = require("@aws-sdk/client-s3");
function getBucketConfig() {
    return {
        bucketName: process.env.B2_BUCKET_NAME ?? '',
        folderPrefix: process.env.AWS_FOLDER_PREFIX ?? '',
    };
}
function createS3Client() {
    const config = {
        region: process.env.B2_REGION || 'us-west-002',
        endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-002.backblazeb2.com',
        credentials: {
            accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
    };
    return new client_s3_1.S3Client(config);
}
//# sourceMappingURL=aws-config.js.map