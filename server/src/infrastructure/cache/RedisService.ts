// src/infrastructure/cache/RedisService.ts — Redis singleton with pub/sub (gracefully optional)
import { createClient, RedisClientType } from 'redis';
import { AppConfig } from '../../shared/config/AppConfig';
import { Logger } from '../../shared/utils/Logger';

const logger = Logger.getInstance();
const config = AppConfig.getInstance();

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private publisher: RedisClientType | null = null;
  public isConnected = false;

  // ── Memory Fallback Stores ──────────────────────────
  private memoryStore = new Map<string, string>();
  private onlineUsersSet = new Set<string>();

  private constructor() {}

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(): Promise<void> {
    if (!config.redisUrl) {
      logger.info('ℹ️ Redis URL not provided. Using Memory Fallback Mode.');
      this.isConnected = false;
      return;
    }

    try {
      const redisConfig = {
        url: config.redisUrl,
        password: config.redisPassword || undefined,
      };

      this.client = createClient(redisConfig) as RedisClientType;
      this.subscriber = this.client.duplicate() as RedisClientType;
      this.publisher = this.client.duplicate() as RedisClientType;

      const connectionTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      );

      await Promise.race([
        Promise.all([
          this.client.connect(),
          this.subscriber.connect(),
          this.publisher.connect(),
        ]),
        connectionTimeout,
      ]);
      
      this.isConnected = true;
      logger.info('✅ Redis Connected (Ready for Pub/Sub and Caching)');
    } catch (error) {
      logger.warn('⚠️  Redis connection failed or timed out. Falling back to Local Memory for social engine.');
      this.isConnected = false;
      this.client = null;
      this.subscriber = null;
      this.publisher = null;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await Promise.all([
      this.client?.disconnect(),
      this.subscriber?.disconnect(),
      this.publisher?.disconnect(),
    ]);
    this.isConnected = false;
  }

  // ── Cache helpers ────────────────────────────────────
  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    }
    // Fallback
    const data = this.memoryStore.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.isConnected && this.client) {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return;
    }
    // Fallback
    this.memoryStore.set(key, serialized);
    if (ttlSeconds) {
      setTimeout(() => this.memoryStore.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.del(key);
      return;
    }
    this.memoryStore.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.isConnected && this.client) {
      return (await this.client.exists(key)) === 1;
    }
    return this.memoryStore.has(key);
  }

  // ── Pub/Sub for real-time events ─────────────────────
  async publish(channel: string, message: unknown): Promise<void> {
    if (this.isConnected && this.publisher) {
      await this.publisher.publish(channel, JSON.stringify(message));
    }
    // Note: Local Pub/Sub could be added with EventEmitter if multi-modular
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (this.isConnected && this.subscriber) {
      await this.subscriber.subscribe(channel, callback);
    }
  }

  // ── Session helpers ──────────────────────────────────
  async setSession(userId: string, data: unknown, ttl = 86400): Promise<void> {
    await this.set(`session:${userId}`, data, ttl);
  }

  async getSession<T>(userId: string): Promise<T | null> {
    return this.get<T>(`session:${userId}`);
  }

  async invalidateSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }

  // ── Online presence tracking ─────────────────────────
  async setOnline(userId: string): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.sAdd('online_users', userId);
      await this.client.expire('online_users', 3600);
      return;
    }
    this.onlineUsersSet.add(userId);
  }

  async setOffline(userId: string): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.sRem('online_users', userId);
      return;
    }
    this.onlineUsersSet.delete(userId);
  }

  async getOnlineUsers(): Promise<string[]> {
    if (this.isConnected && this.client) {
      return this.client.sMembers('online_users');
    }
    return Array.from(this.onlineUsersSet);
  }

  async isOnline(userId: string): Promise<boolean> {
    if (this.isConnected && this.client) {
      return this.client.sIsMember('online_users', userId);
    }
    return this.onlineUsersSet.has(userId);
  }
}
