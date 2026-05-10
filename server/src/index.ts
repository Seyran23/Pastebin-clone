import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { sequelize } from './db/models';
import { errorHandler } from './middlewares/error-handler';
import authRouter from './modules/auth/route';
import pasteRouter from './modules/paste/route';
import userRouter from './modules/user/route';
import { startExpiredPasteJobs } from './services/expiredPastes.service';
import { CLIENT_URL, PORT } from './utils/env';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: CLIENT_URL }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/pastes', pasteRouter);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  await sequelize.sync({ alter: true });
  console.info('Database synchronized');

  startExpiredPasteJobs();

  app.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
