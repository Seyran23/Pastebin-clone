import type { Readable } from 'stream';

interface StreamResult {
  buffer: Buffer;
  memoryAmount: string;
}

const streamToBuffer = (stream: Readable): Promise<StreamResult> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      totalBytes += chunk.length;
    });
    stream.on('error', reject);
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks as Uint8Array[]);
      resolve({ buffer, memoryAmount: `${(totalBytes / 1024).toFixed(2)} KB` });
    });
  });
};

export interface FileResult {
  contentType: string;
  buffer: Buffer;
  memoryAmount: string;
  isImage: boolean;
  textContent?: string;
}

export const formatImageFile = async (response: {
  Body: Readable;
  ContentType: string;
}): Promise<FileResult> => {
  const { buffer, memoryAmount } = await streamToBuffer(response.Body);
  return { contentType: response.ContentType, buffer, memoryAmount, isImage: true };
};

export const formatTextFile = async (response: {
  Body: Readable;
  ContentType: string;
}): Promise<FileResult> => {
  const { buffer, memoryAmount } = await streamToBuffer(response.Body);
  return {
    contentType: response.ContentType,
    buffer,
    textContent: buffer.toString('utf-8'),
    memoryAmount,
    isImage: false,
  };
};
