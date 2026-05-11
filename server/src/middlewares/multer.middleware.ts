import multer from 'multer';
import multerS3 from 'multer-s3';

import s3 from '@/modules/cloud/s3Client';
import { S3_BUCKET_NAME } from '@/utils/env';
import randomFileName from '@/utils/randomFileName';

import { AppError } from './error-handler';

const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME,
    key: (_req, _file, cb) => {
      cb(null, randomFileName('avatar'));
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(422, 'Only .jpeg, .jpg, .png file formats allowed!'));
    }
  },
});

export default upload;
