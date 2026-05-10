import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import s3 from './s3Client';
import { S3_BUCKET_NAME } from '../../utils/env';
import { formatImageFile, formatTextFile } from './utils';
import type { FileResult } from './utils';
import { AppError } from '../../middlewares/error-handler';

export const getFileFromS3 = async (fileName: string): Promise<FileResult> => {
  try {
    const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileName });
    const response = await s3.send(command);
    const isImage = response.ContentType?.startsWith('image/') ?? false;

    const body = { Body: response.Body as Readable, ContentType: response.ContentType ?? 'application/octet-stream' };
    return isImage ? formatImageFile(body) : formatTextFile(body);
  } catch (error) {
    throw new AppError(500, 'Error retrieving file from S3');
  }
};

export const uploadFileToS3 = async (fileName: string, fileContent: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType,
  });
  await s3.send(command);
  return fileName;
};

export const deleteFileFromS3 = async (fileName: string): Promise<void> => {
  const command = new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileName });
  await s3.send(command);
};

export { s3 };
