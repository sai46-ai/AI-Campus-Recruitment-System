import winston from 'winston';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'otp',
  'otpcode',
  'accesstoken',
  'refreshtoken',
  'token',
  'authorization',
  'cookie',
  'csrftoken',
  'apikey',
  'clientsecret',
  'secret',
  'gemini_api_key',
  'mongouri',
  'mongodb_uri',
]);

export const redactSensitiveData = (val: any, seen = new WeakSet()): any => {
  if (val === null || val === undefined) return val;
  if (typeof val !== 'object') return val;

  if (seen.has(val)) return '[CIRCULAR]';
  seen.add(val);

  if (Array.isArray(val)) {
    return val.map((item) => redactSensitiveData(item, seen));
  }

  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    const lowerKey = k.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = redactSensitiveData(v, seen);
    } else {
      clean[k] = v;
    }
  }
  return clean;
};

const determineLogLevel = (): string => {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  if (process.env.NODE_ENV === 'test') return 'warn';
  if (process.env.NODE_ENV === 'production') return 'info';
  return 'debug';
};

const isProduction = process.env.NODE_ENV === 'production';

// Production structured JSON format
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: () => new Date().toISOString() }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    const redacted = redactSensitiveData(info);
    return {
      timestamp: redacted.timestamp,
      level: redacted.level,
      service: 'ai-campus-recruitment-backend',
      correlationId: redacted.correlationId || redacted.reqId || undefined,
      message: redacted.message,
      ...(redacted.stack ? { stack: redacted.stack } : {}),
      ...(Object.keys(redacted).filter(
        (k) => !['timestamp', 'level', 'message', 'correlationId', 'reqId', 'stack'].includes(k)
      ).length > 0
        ? { metadata: redactSensitiveData({ ...redacted, timestamp: undefined, level: undefined, message: undefined }) }
        : {}),
    };
  })(),
  winston.format.json()
);

// Development human-readable format
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const corr = info.correlationId ? ` [${info.correlationId}]` : '';
    const stack = info.stack ? `\n${info.stack}` : '';
    return `[${info.timestamp}] [${info.level}]${corr}: ${info.message}${stack}`;
  })
);

export const logger = winston.createLogger({
  level: determineLogLevel(),
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: false,
    }),
  ],
  exitOnError: false,
});

export const getChildLogger = (correlationId?: string) => {
  if (!correlationId) return logger;
  return logger.child({ correlationId });
};

export default logger;
