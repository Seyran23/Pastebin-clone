import { createClient } from 'redis';

import { REDIS_URL } from './env';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err.message);
});

void (async () => {
  await redisClient.connect();
  console.info('Connected to Redis');
})();

export default redisClient;
