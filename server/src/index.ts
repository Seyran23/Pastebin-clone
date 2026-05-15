import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import { sequelize } from './db/models';
import { errorHandler } from './middlewares/error-handler';
import authRouter from './modules/auth/route';
import healthRouter from './modules/health/route';
import pasteRouter from './modules/paste/route';
import userRouter from './modules/user/route';
import { startExpiredPasteJobs } from './services/expiredPastes.service';
import { CLIENT_URL, NODE_ENV, PORT } from './utils/env';
import logger from './utils/logger';
import redisClient from './utils/redis';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }),
);
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: CLIENT_URL }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/pastes', pasteRouter);
app.use('/api/health', healthRouter);

app.use(errorHandler);

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

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
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
    });

    setTimeout(() => {
      logger.error('Shutdown timed out — force killing');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { void shutdown('SIGINT'); });
};

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
