// src/infrastructure/database/DatabaseService.ts — Mongoose singleton
import mongoose from 'mongoose';
import { AppConfig } from '../../shared/config/AppConfig';
import { Logger } from '../../shared/utils/Logger';

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

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    const config = AppConfig.getInstance();

    mongoose.connection.on('connected', () => {
      this._isConnected = true;
      logger.info('✅ MongoDB connected via Mongoose');
    });

    mongoose.connection.on('disconnected', () => {
      this._isConnected = false;
      logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    await mongoose.connect(config.mongodbUri, {
      socketTimeoutMS: 45000,
    });

    this._isConnected = true;
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this._isConnected = false;
    logger.info('🔌 MongoDB disconnected');
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) return false;
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}
