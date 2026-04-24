// src/infrastructure/database/DatabaseService.ts — Prisma singleton
import { prisma } from './prisma.js';
import { AppConfig } from "../../shared/config/AppConfig.js";
import { Logger } from "../../shared/utils/Logger.js";

const logger = Logger.getInstance();

export class DatabaseService {
  private static instance: DatabaseService;
  private _isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  get client(): PrismaClient {
    return prisma;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    try {
      await prisma.$connect();
      this._isConnected = true;
      logger.info('✅ Database connected via Prisma singleton (PostgreSQL)');
    } catch (error: any) {
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
