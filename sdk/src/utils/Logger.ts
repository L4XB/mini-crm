import winston from 'winston';

/**
 * Logger utility for the Mini CRM SDK
 */
export class Logger {
  private logger: winston.Logger;

  /**
   * Create a new logger instance
   * @param level Logging level (debug, info, warn, error)
   */
  constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param meta Additional metadata
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param meta Additional metadata
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param meta Additional metadata
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param error Error object or additional metadata
   */
  error(message: string, error?: any): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: error.message,
        stack: error.stack
      });
    } else {
      this.logger.error(message, error);
    }
  }
}
