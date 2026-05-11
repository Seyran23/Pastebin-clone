declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: 'user' | 'admin';
      isActivated: boolean;
      email?: string;
    }
  }
}

export type AuthUser = Express.User;

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
