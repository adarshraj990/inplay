// src/app.ts — Express Application Factory
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { AppConfig } from "./shared/config/AppConfig.js";
import { Logger } from "./shared/utils/Logger.js";
import { AppError } from "./shared/errors/AppError.js";
import { swaggerSpec } from "./shared/config/swagger.js";
import path from 'path';
import crypto from 'crypto';
import { auth } from "./lib/auth.js";
import { toNodeHandler } from 'better-auth/node';

// ── Route imports ────────────────────────────────────────
import { authRouter } from "./presentation/http/routes/auth.routes.js";
import { userRouter } from "./presentation/http/routes/user.routes.js";
import { roomRouter } from "./presentation/http/routes/room.routes.js";
import { socialRouter } from "./presentation/http/routes/social.routes.js";
import { gameRouter } from "./presentation/http/routes/game.routes.js";
import { messagesRouter } from "./presentation/http/routes/messages.routes.js";
import rewardRouter from "./presentation/http/routes/reward.routes.js";
import { reportRouter } from "./presentation/http/routes/report.routes.js";
import { StatsController } from "./presentation/http/controllers/StatsController.js";
import { SyncStatusController } from "./presentation/http/controllers/SyncStatusController.js";
import { DatabaseService } from "./infrastructure/database/DatabaseService.js";

const logger = Logger.getInstance();

export function createApp(): Application {
  const app = express();
  app.set('trust proxy', 1); 
  const config = AppConfig.getInstance();

  // ── Security Middlewares ─────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Let frontend handle CSP
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: true,
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

  // ── Better-Auth Integration (MOVED ABOVE BODY PARSERS) ──────────
  app.use('/api/auth', (req, res) => toNodeHandler(auth)(req, res));

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
  app.get('/health', async (_req: Request, res: Response) => {
    const config = AppConfig.getInstance();
    const db = DatabaseService.getInstance();
    const isDbConnected = db.isConnected;

    res.json({
      status: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      env: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // ── Keep-Awake Ping ──────────────────────────────────
  app.get('/ping', (_req: Request, res: Response) => {
    res.send('pong');
  });

  const syncStatusController = new SyncStatusController();
  app.get('/health/sync', (req, res) => syncStatusController.getSyncStatus(req, res));

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
  
  const statsController = new StatsController();
  apiV1.get('/stats/overview', statsController.getOverview);

  app.use('/api/v1', apiV1);

  // New Social & Messaging Routes (Fresh Start)
  app.use('/api/social', socialRouter);
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
