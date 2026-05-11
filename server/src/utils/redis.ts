import { createClient } from 'redis';

import { REDIS_URL } from './env';
import logger from './logger';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err: Error) => {
  logger.error({ err }, 'Redis error');
});

void (async () => {
  await redisClient.connect();
  logger.info('Connected to Redis');
})();

export default redisClient;
