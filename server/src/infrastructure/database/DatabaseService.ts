// src/infrastructure/database/DatabaseService.ts — Prisma singleton
import { PrismaClient } from '@prisma/client';
import { AppConfig } from '../../shared/config/AppConfig';
import { Logger } from '../../shared/utils/Logger';

const logger = Logger.getInstance();

export class DatabaseService {
  private static instance: DatabaseService;
  private _client: PrismaClient | null = null;
  private _isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  get client(): PrismaClient {
    if (!this._client) {
      throw new Error('Database client not initialized. Call connect() first.');
    }
    return this._client;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    const config = AppConfig.getInstance();

    try {
      this._client = new PrismaClient({
        datasources: {
          db: {
            url: config.databaseUrl,
          },
        },
        log: config.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
      });

      await this._client.$connect();
      this._isConnected = true;
      logger.info('✅ Database connected via Prisma (PostgreSQL)');
    } catch (error: any) { // Explicitly any or handle correctly (Prisma errors can be complex)
      logger.error('❌ Database connection error:', error);
      this._isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.$disconnect();
      this._isConnected = false;
      logger.info('🔌 Database disconnected');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this._isConnected || !this._client) return false;
      await this._client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
