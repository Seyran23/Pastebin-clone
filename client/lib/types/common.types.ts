export interface CustomError {
  message: string;
  errors: { field: string; message: string; cause?: string }[] | [];
}

export type Exposure = 'public' | 'unlisted' | 'private';

export interface IRelatedPage {
  href: string;
  label: string;
}
