import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

import { sequelize } from './db/models';
import { errorHandler } from './middlewares/error-handler';
import authRouter from './modules/auth/route';
import healthRouter from './modules/health/route';
import pasteRouter from './modules/paste/route';
import userRouter from './modules/user/route';
import { startExpiredPasteJobs } from './services/expiredPastes.service';
import { CLIENT_URL, PORT } from './utils/env';
import logger from './utils/logger';

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: CLIENT_URL }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/pastes', pasteRouter);
app.use('/health', healthRouter);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  await sequelize.sync({ alter: true });
  logger.info('Database synchronized');

  startExpiredPasteJobs();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
