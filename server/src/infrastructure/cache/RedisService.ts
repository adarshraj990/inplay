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
  private isConnected = false;

  private constructor() {}

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(): Promise<void> {
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
    } catch (error) {
      logger.warn('⚠️  Redis connection failed or timed out. Features relying on Redis (Sockets, caching) will be disabled. Proceeding gracefully...');
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
    if (!this.isConnected || !this.client) return null;
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    return (await this.client.exists(key)) === 1;
  }

  // ── Pub/Sub for real-time events ─────────────────────
  async publish(channel: string, message: unknown): Promise<void> {
    if (!this.isConnected || !this.publisher) return;
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.isConnected || !this.subscriber) return;
    await this.subscriber.subscribe(channel, callback);
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
    if (!this.isConnected || !this.client) return;
    await this.client.sAdd('online_users', userId);
    await this.client.expire('online_users', 3600);
  }

  async setOffline(userId: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    await this.client.sRem('online_users', userId);
  }

  async getOnlineUsers(): Promise<string[]> {
    if (!this.isConnected || !this.client) return [];
    return this.client.sMembers('online_users');
  }

  async isOnline(userId: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    return this.client.sIsMember('online_users', userId);
  }
}
