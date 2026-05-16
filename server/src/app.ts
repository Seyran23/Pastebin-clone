import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error-handler';
import authRouter from './modules/auth/route';
import healthRouter from './modules/health/route';
import pasteRouter from './modules/paste/route';
import userRouter from './modules/user/route';
import { CLIENT_URL } from './utils/env';
import logger from './utils/logger';

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

export default app;
