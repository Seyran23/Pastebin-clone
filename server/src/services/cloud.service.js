const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  S3_ACCEESS_KEY,
  S3_SECRET_ACCEESS_KEY,
  S3_BUCKET_REGION,
  S3_BUCKET_NAME,
} = require("../utils/enviromentVariables");

const s3 = new S3Client({
  credentials: {
    accessKeyId: S3_ACCEESS_KEY,
    secretAccessKey: S3_SECRET_ACCEESS_KEY,
  },
  region: S3_BUCKET_REGION,
});

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    stream.on("data", (chunk) => {
      chunks.push(chunk);
      totalBytes += chunk.length;
    });

    stream.on("error", reject);

    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const memoryAmount = `${(totalBytes / 1024).toFixed(2)} KB`;
      resolve({ buffer, memoryAmount });
    });
  });
};

const getFileFromS3 = async (fileName) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
  };
  const command = new GetObjectCommand(params);

  const response = await s3.send(command);

  // console.log(response)

  try {
    const contentType = response.ContentType;
    const isImage = contentType.startsWith("image/");

    if (isImage) {
      // image files are streamed directly as binary
      const imageBuffer = await streamToBuffer(response.Body);
      console.log({
        contentType,
        ...imageBuffer,
        isImage: true,
      });
      return {
        contentType,
        ...imageBuffer,
        isImage: true,
      };
    } else {
      // text files are streamed as UTF-8 string
      const textBuffer = await streamToBuffer(response.Body);
      const textContent = textBuffer.toString("utf-8");
      return {
        contentType,
        textContent,
        memoryAmount: textBuffer.memoryAmount,
        isImage: false,
      };
    }
  } catch (error) {
    throw new Error(`Error retrieving file from S3:  ${error.message}`);
  }
};

const uploadFileToS3 = async (fileName, fileContent, contentType) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return fileName;
};

const deleteFileFromS3 = async (fileName) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
  };
  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};

module.exports = { getFileFromS3, uploadFileToS3, deleteFileFromS3, s3 };
