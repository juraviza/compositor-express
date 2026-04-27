"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.getFileUrl = getFileUrl;
exports.deleteFile = deleteFile;
exports.downloadToFile = downloadToFile;
exports.uploadFromFile = uploadFromFile;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_config_1 = require("./aws-config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let _client = null;
function client() {
    if (!_client)
        _client = (0, aws_config_1.createS3Client)();
    return _client;
}
async function generatePresignedUploadUrl(fileName, contentType, isPublic = false) {
    const { bucketName, folderPrefix } = (0, aws_config_1.getBucketConfig)();
    const cloud_storage_path = `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${fileName}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: cloud_storage_path,
        ContentType: contentType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(client(), command, { expiresIn: 3600 });
    return { uploadUrl, cloud_storage_path };
}
async function getFileUrl(cloud_storage_path, isPublic = false) {
    const { bucketName } = (0, aws_config_1.getBucketConfig)();
    if (isPublic) {
        const region = (await client().config.region()) || 'us-east-1';
        return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
    }
    const command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path });
    return await (0, s3_request_presigner_1.getSignedUrl)(client(), command, { expiresIn: 3600 });
}
async function deleteFile(cloud_storage_path) {
    const { bucketName } = (0, aws_config_1.getBucketConfig)();
    await client().send(new client_s3_1.DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}
async function downloadToFile(cloud_storage_path, localPath) {
    const { bucketName } = (0, aws_config_1.getBucketConfig)();
    const command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path });
    const res = await client().send(command);
    await fs.promises.mkdir(path.dirname(localPath), { recursive: true });
    const stream = res.Body;
    await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(localPath);
        stream.pipe(ws);
        ws.on('finish', () => resolve());
        ws.on('error', reject);
        stream.on('error', reject);
    });
}
async function uploadFromFile(localPath, cloud_storage_path, contentType) {
    const { bucketName } = (0, aws_config_1.getBucketConfig)();
    const body = await fs.promises.readFile(localPath);
    await client().send(new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: cloud_storage_path,
        Body: body,
        ContentType: contentType,
    }));
}
//# sourceMappingURL=s3.js.map