import { createClient } from 'redis';
import { REDIS_URL } from './env';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err.message);
});

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

export default redisClient;
