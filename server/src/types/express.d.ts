import type { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  username: string;
  role: 'user' | 'admin';
  isActivated: boolean;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

declare module 'multer-s3' {
  interface File extends Express.Multer.File {
    bucket: string;
    key: string;
    acl: string;
    contentType: string;
    contentDisposition: string | null;
    storageClass: string;
    serverSideEncryption: string | null;
    metadata: Record<string, unknown>;
    location: string;
    etag: string;
    versionId: string | null;
  }
}
