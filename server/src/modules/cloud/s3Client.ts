import { S3Client } from '@aws-sdk/client-s3';

import { S3_ACCESS_KEY, S3_BUCKET_REGION, S3_SECRET_ACCESS_KEY } from '@/utils/env';

const s3 = new S3Client({
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  region: S3_BUCKET_REGION,
});

export default s3;
