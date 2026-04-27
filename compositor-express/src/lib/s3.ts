import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';
import * as fs from 'fs';
import * as path from 'path';

let _client: ReturnType<typeof createS3Client> | null = null;
function client() {
  if (!_client) _client = createS3Client();
  return _client;
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const { bucketName, folderPrefix } = getBucketConfig();
  const cloud_storage_path = `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloud_storage_path: string, isPublic = false): Promise<string> {
  const { bucketName } = getBucketConfig();
  if (isPublic) {
    const region = (await client().config.region()) || 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
  }
  const command = new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path });
  return await getSignedUrl(client(), command, { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string) {
  const { bucketName } = getBucketConfig();
  await client().send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}

/** Download an S3 object to a local file path. */
export async function downloadToFile(cloud_storage_path: string, localPath: string) {
  const { bucketName } = getBucketConfig();
  const command = new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path });
  const res = await client().send(command);
  await fs.promises.mkdir(path.dirname(localPath), { recursive: true });
  const stream = res.Body as NodeJS.ReadableStream;
  await new Promise<void>((resolve, reject) => {
    const ws = fs.createWriteStream(localPath);
    stream.pipe(ws);
    ws.on('finish', () => resolve());
    ws.on('error', reject);
    stream.on('error', reject);
  });
}

/** Upload a local file to S3 with given key. */
export async function uploadFromFile(localPath: string, cloud_storage_path: string, contentType: string) {
  const { bucketName } = getBucketConfig();
  const body = await fs.promises.readFile(localPath);
  await client().send(new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    Body: body,
    ContentType: contentType,
  }));
}
