import http from 'http';

import { GRACEFUL_SHUTDOWN_TIMEOUT_MS } from './config/timing';
import { sequelize } from './db/models';
import { startExpiredPasteJobs } from './services/expiredPastes.service';
import { NODE_ENV, PORT } from './utils/env';
import logger from './utils/logger';
import redisClient from './utils/redis';
import app from './app';

const startServer = async (): Promise<void> => {
  if (NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized (dev mode)');
  }

  startExpiredPasteJobs();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${NODE_ENV}]`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(() => {
      void (async () => {
        try {
          await sequelize.close();
          logger.info('Database connection closed');

          await redisClient.quit();
          logger.info('Redis connection closed');

          logger.info('Shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during shutdown');
          process.exit(1);
        }
      })();
    });

    setTimeout(() => {
      logger.error('Shutdown timed out — force killing');
      process.exit(1);
    }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);
  };

  process.on('SIGTERM', () => { shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { shutdown('SIGINT'); });
};

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
