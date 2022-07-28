import winston from "winston";

interface LoggerInterface {
  log: (message: string) => void;
  error: (message: string) => void;
}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

class WinstonLogger implements LoggerInterface {
  private readonly logger: any;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.ENV_STAGE === "prod" ? "error" : "info",
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}

export const logger = new WinstonLogger();
