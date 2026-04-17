import 'dotenv/config';

export class AppConfig {
  private static instance: AppConfig;

  public readonly nodeEnv: string;
  public readonly port: number;
  public readonly databaseUrl: string;
  public readonly redisUrl: string;
  public readonly redisPassword: string;
  public readonly jwtSecret: string;
  public readonly jwtRefreshSecret: string;
  public readonly jwtExpiresIn: string;
  public readonly jwtRefreshExpiresIn: string;
  public readonly socketCorsOrigin: string;
  public readonly corsOrigins: string[];
  public readonly rateLimitWindowMs: number;
  public readonly rateLimitMax: number;
  public readonly agoraAppId: string;
  public readonly agoraAppCertificate: string;

  private constructor() {
    this.nodeEnv = process.env.NODE_ENV ?? 'development';
    this.port = parseInt(process.env.PORT ?? '5000', 10);
    this.databaseUrl = this.require('DATABASE_URL');
    this.redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.redisPassword = process.env.REDIS_PASSWORD ?? '';
    this.jwtSecret = this.require('JWT_SECRET');
    this.jwtRefreshSecret = this.require('JWT_REFRESH_SECRET');
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    this.socketCorsOrigin = process.env.SOCKET_CORS_ORIGIN ?? 'http://localhost:3001';
    this.corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(',');
    this.rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10);
    this.rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);
    this.agoraAppId = process.env.AGORA_APP_ID ?? 'PLACEHOLDER_APP_ID';
    this.agoraAppCertificate = process.env.AGORA_APP_CERTIFICATE ?? 'PLACEHOLDER_CERTIFICATE';
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  private require(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  get isDevelopment(): boolean { return this.nodeEnv === 'development'; }
  get isProduction(): boolean { return this.nodeEnv === 'production'; }
  get isTest(): boolean { return this.nodeEnv === 'test'; }
}
