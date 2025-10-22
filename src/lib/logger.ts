// Structured logging service with different levels and environments
interface LogContext {
  userId?: string;
  ambassadorId?: string;
  action?: string;
  component?: string;
  [key: string]: unknown;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        if (error) console.warn(error);
        break;
      case 'error':
        console.error(formattedMessage);
        if (error) console.error(error);
        break;
    }
  }

  private async logToService(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
      // For now, we'll just store critical errors locally
      if (entry.level === 'error') {
        const logs = this.getStoredLogs();
        logs.push(entry);
        // Keep only last 100 error logs
        const recentLogs = logs.slice(-100);
        localStorage.setItem('app_error_logs', JSON.stringify(recentLogs));
      }
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to log to service:', error);
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_error_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  debug(message: string, context?: LogContext): void {
    this.logToConsole('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logToConsole('info', message, context);
    this.logToService(entry);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    this.logToConsole('warn', message, context, error);
    this.logToService(entry);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    this.logToConsole('error', message, context, error);
    this.logToService(entry);
  }

  // Utility methods for common logging scenarios
  apiError(endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API call failed: ${endpoint}`, {
      ...context,
      endpoint,
      errorMessage: error.message,
    }, error);
  }

  userAction(action: string, userId?: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      action,
      userId,
    });
  }

  componentError(component: string, error: Error, context?: LogContext): void {
    this.error(`Component error in ${component}`, {
      ...context,
      component,
      errorMessage: error.message,
    }, error);
  }

  // Get stored error logs for debugging
  getErrorLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  // Clear stored logs
  clearLogs(): void {
    localStorage.removeItem('app_error_logs');
  }
}

export const logger = new Logger();
export type { LogContext, LogLevel, LogEntry };