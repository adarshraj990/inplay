// src/app.ts — Express Application Factory
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { AppConfig } from './shared/config/AppConfig';
import { Logger } from './shared/utils/Logger';
import { AppError } from './shared/errors/AppError';
import { swaggerSpec } from './shared/config/swagger';
import path from 'path';

// ── Route imports ────────────────────────────────────────
import { authRouter } from './presentation/http/routes/auth.routes';
import { userRouter } from './presentation/http/routes/user.routes';
import { roomRouter } from './presentation/http/routes/room.routes';
import { friendsRouter } from './presentation/http/routes/friends.routes';
import { gameRouter } from './presentation/http/routes/game.routes';
import { messagesRouter } from './presentation/http/routes/messages.routes';
import rewardRouter from './presentation/http/routes/reward.routes';
import { reportRouter } from './presentation/http/routes/report.routes';

const logger = Logger.getInstance();

export function createApp(): Application {
  const app = express();
  const config = AppConfig.getInstance();

  // ── Security Middlewares ─────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Let frontend handle CSP
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  }));

  // ── Performance Middlewares ──────────────────────────
  app.use(compression());

  // ── Rate Limiting ────────────────────────────────────
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api/', limiter);

  // ── Request Parsing ──────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Static Files ─────────────────────────────────────
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ── Logging ──────────────────────────────────────────
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message: any) => logger.info(message.trim()) },
    }));
  }

  // ── Request ID Middleware ────────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
    next();
  });

  // ── Health Check ─────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      env: config.nodeEnv,
      version: process.env.npm_package_version,
    });
  });

  // ── API Documentation ────────────────────────────────
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Indplay API Docs',
  }));

  // ── API Routes ───────────────────────────────────────
  const apiV1 = express.Router();
  apiV1.use('/auth', authRouter);
  apiV1.use('/users', userRouter);
  apiV1.use('/rooms', roomRouter);
  apiV1.use('/games', gameRouter);
  apiV1.use('/rewards', rewardRouter);
  apiV1.use('/reports', reportRouter);
  app.use('/api/v1', apiV1);

  // New Social & Messaging Routes (Fresh Start)
  app.use('/api/friends', friendsRouter);
  app.use('/api/messages', messagesRouter);

  // ── 404 Handler ──────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // ── Global Error Handler ─────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errorCode: err.errorCode,
      });
    }
    logger.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  return app;
}
