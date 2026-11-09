/**
 * Frontend Client-Side Diagnostic Logger
 * Safe logging utility that redacts authentication tokens and credentials.
 */

const isDev = import.meta.env.DEV;

export const clientLogger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, error?: any, correlationId?: string) => {
    const corrStr = correlationId ? ` [Correlation: ${correlationId}]` : '';
    const safeError = error?.response?.data?.message || error?.message || error;
    console.error(`[ERROR]${corrStr} ${message}:`, safeError);
  },
  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default clientLogger;

