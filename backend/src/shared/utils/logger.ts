import winston from 'winston';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
winston.addColors({ error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' });

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((i) => `[${i.timestamp}] [${i.level}]: ${i.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
