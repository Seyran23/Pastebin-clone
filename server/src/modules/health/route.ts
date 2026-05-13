import { Router } from 'express';

import { sequelize } from '@/db/models';
import redisClient from '@/utils/redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API, database, and Redis health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: One or more services degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
router.get('/', (_req, res) => {
  void (async () => {
    const [db, redis] = await Promise.allSettled([sequelize.authenticate(), redisClient.ping()]);

    const status = {
      status: db.status === 'fulfilled' && redis.status === 'fulfilled' ? 'ok' : 'degraded',
      db: db.status === 'fulfilled' ? 'ok' : 'error',
      redis: redis.status === 'fulfilled' ? 'ok' : 'error',
    };

    res.status(status.status === 'ok' ? 200 : 503).json(status);
  })();
});

export default router;
