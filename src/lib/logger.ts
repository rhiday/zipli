import { v4 as uuidv4 } from 'uuid';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

interface LogOptions {
  level?: LogLevel;
  context?: LogContext;
  transactionId?: string;
}

// Pending operations tracker
const pendingOperations = new Map<string, { 
  startTime: number;
  context: LogContext;
  operationType: string;
}>();

/**
 * Main logger utility with transaction tracking
 */
class Logger {
  static isProduction = process.env.NODE_ENV === 'production';
  static debugEnabled = !Logger.isProduction;
  
  /**
   * Generate a unique transaction ID
   */
  static generateTransactionId(): string {
    return uuidv4();
  }

  /**
   * Log a message with structured format and context
   */
  static log(message: string, options: LogOptions = {}): void {
    const { 
      level = 'info', 
      context = {}, 
      transactionId = 'none'
    } = options;
    
    if (level === 'debug' && !Logger.debugEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${level.toUpperCase()}] [${transactionId}]`;
    
    const logMessage = `${logPrefix} ${message}`;
    
    // Only show context if not empty
    const hasContext = Object.keys(context).length > 0;
    
    switch (level) {
      case 'error':
        console.error(logMessage, hasContext ? context : '');
        break;
      case 'warn':
        console.warn(logMessage, hasContext ? context : '');
        break;
      case 'debug':
        console.debug(logMessage, hasContext ? context : '');
        break;
      case 'info':
      default:
        console.log(logMessage, hasContext ? context : '');
    }
  }
  
  /**
   * Log an error with full stack trace and context
   */
  static error(message: string, error: Error, context: LogContext = {}, transactionId: string = 'none'): void {
    const errorContext = {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    };
    
    Logger.log(message, { level: 'error', context: errorContext, transactionId });
  }
  
  /**
   * Start tracking an operation
   */
  static startOperation(operationType: string, context: LogContext = {}): string {
    const transactionId = Logger.generateTransactionId();
    const startTime = Date.now();
    
    pendingOperations.set(transactionId, {
      startTime,
      context,
      operationType
    });
    
    Logger.log(`Started: ${operationType}`, {
      level: 'info',
      context,
      transactionId
    });
    
    return transactionId;
  }
  
  /**
   * End tracking an operation
   */
  static endOperation(transactionId: string, result: any = null, error: Error | null = null): void {
    const operation = pendingOperations.get(transactionId);
    
    if (!operation) {
      Logger.log(`Attempted to end unknown operation`, {
        level: 'warn',
        transactionId
      });
      return;
    }
    
    const { startTime, context, operationType } = operation;
    const duration = Date.now() - startTime;
    
    const operationContext = {
      ...context,
      durationMs: duration,
      success: !error,
      result: error ? null : result
    };
    
    if (error) {
      Logger.error(`Failed: ${operationType}`, error, operationContext, transactionId);
    } else {
      Logger.log(`Completed: ${operationType}`, {
        level: 'info',
        context: operationContext,
        transactionId
      });
    }
    
    pendingOperations.delete(transactionId);
  }
  
  /**
   * Execute a function with operation tracking
   * Automatically handles errors and timing
   */
  static async trackOperation<T>(
    operationType: string, 
    fn: (transactionId: string) => Promise<T>,
    context: LogContext = {}
  ): Promise<T> {
    const transactionId = Logger.startOperation(operationType, context);
    
    try {
      const result = await fn(transactionId);
      Logger.endOperation(transactionId, result);
      return result;
    } catch (error) {
      Logger.endOperation(transactionId, null, error as Error);
      throw error;
    }
  }
  
  /**
   * Prevent duplicate operations with the same key
   */
  static async preventDuplicates<T>(
    key: string,
    fn: () => Promise<T>,
    context: LogContext = {}
  ): Promise<T> {
    const operationKey = `dedup:${key}`;
    
    if (pendingOperations.has(operationKey)) {
      Logger.log(`Prevented duplicate operation: ${key}`, {
        level: 'warn',
        context
      });
      throw new Error(`Operation already in progress: ${key}`);
    }
    
    pendingOperations.set(operationKey, {
      startTime: Date.now(),
      context,
      operationType: `dedup:${key}`
    });
    
    try {
      const result = await fn();
      pendingOperations.delete(operationKey);
      return result;
    } catch (error) {
      pendingOperations.delete(operationKey);
      throw error;
    }
  }
}

export default Logger; 