import crypto from 'crypto';

const generateBase64HashService = (input: string): string => {
  const hash = crypto.createHash('sha256').update(input).digest('base64');
  return hash.replace(/\+/g, '').replace(/\//g, '').replace(/=/g, '').substring(0, 8);
};

export default generateBase64HashService;
