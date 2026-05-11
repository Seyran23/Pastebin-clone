import pino from 'pino';

import { NODE_ENV } from './env';

const logger = pino({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  ...(NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
    },
  }),
});

export default logger;
