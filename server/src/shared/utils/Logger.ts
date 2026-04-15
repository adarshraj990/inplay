// src/shared/utils/Logger.ts — Winston structured logger
import winston, { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${stack ?? message}${metaStr}`;
});

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    const logsDir = path.join(process.cwd(), 'logs');

    this.logger = createLogger({
      level: isProd ? 'warn' : 'debug',
      format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        isProd ? json() : combine(colorize(), devFormat),
      ),
      transports: [
        new transports.Console(),
        ...(isProd
          ? [
              new DailyRotateFile({
                filename: path.join(logsDir, 'error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: '14d',
                maxSize: '20m',
              }),
              new DailyRotateFile({
                filename: path.join(logsDir, 'combined-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                maxSize: '20m',
              }),
            ]
          : []),
      ],
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, ...meta: unknown[]): void {
    this.logger.info(message, ...meta);
  }
  warn(message: string, ...meta: unknown[]): void {
    this.logger.warn(message, ...meta);
  }
  error(message: string, ...meta: unknown[]): void {
    this.logger.error(message, ...meta);
  }
  debug(message: string, ...meta: unknown[]): void {
    this.logger.debug(message, ...meta);
  }
}
