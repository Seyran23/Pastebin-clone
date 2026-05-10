import { v6 as uuidv6 } from 'uuid';

const randomFileName = (prefix: string): string => {
  const randomStr = uuidv6().split('-').join('');
  return `${prefix}-${randomStr}`;
};

export default randomFileName;
