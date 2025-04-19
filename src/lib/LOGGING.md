# Zipli Logging System

This document explains how to use the Zipli application's advanced logging system to help with debugging, error handling, and preventing duplicate operations.

## Basic Usage

### Simple Logging

```typescript
import Logger from '../lib/logger';

// Basic usage - different log levels
Logger.log('User signed in', { level: 'info' });
Logger.log('Debug information', { level: 'debug' }); // Only shows in development
Logger.log('Warning about something', { level: 'warn' });
Logger.log('Something went wrong', { level: 'error' });

// With additional context
Logger.log('Action occurred', { 
  context: { userId: '123', action: 'update' } 
});
```

### Logging Errors with Stack Traces

```typescript
try {
  // some operation that might fail
} catch (err) {
  Logger.error('Operation failed', err as Error, { 
    additionalContext: 'Was trying to save user data' 
  });
}
```

## Advanced Features

### Transaction Tracking

Track related log entries with transaction IDs to group them together:

```typescript
// Generate a transaction ID
const txId = Logger.generateTransactionId();

// Use it in multiple places
Logger.log('Starting process', { transactionId: txId });
// ...later
Logger.log('Process step 2', { transactionId: txId });
// ...later
Logger.log('Process completed', { transactionId: txId });
```

### Automatic Operation Tracking

Track the entire lifecycle of an operation, including timing, success/failure:

```typescript
const result = await Logger.trackOperation('userRegistration', async (txId) => {
  // Operation code here...
  Logger.log('Registration step', { transactionId: txId });
  // ...more code
  return { success: true };
});
```

### Preventing Duplicate Operations

Ensure that operations are not executed multiple times concurrently:

```typescript
await Logger.preventDuplicates('processPayment:123', async () => {
  // This code will only run once at a time for this key
  await processPayment();
});

// If called again before the first one completes, it will throw an error
```

## React Component Integration

### Tracking Component Lifecycle

Use the `useComponentLogger` hook:

```typescript
function MyComponent() {
  const txId = useComponentLogger('MyComponent');
  
  // Use the transaction ID for all logs in this component
  const handleClick = () => {
    Logger.log('Button clicked', { transactionId: txId });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

## Log Format

Our logs follow this format:

```
[TIMESTAMP] [LEVEL] [TRANSACTION_ID] Message Context
```

Example:
```
[2023-04-22T15:30:45.123Z] [INFO] [a1b2c3d4] User login successful { userId: "123", loginMethod: "email" }
```

## Best Practices

1. **Always include context** - Add relevant information to help understand what happened
2. **Use transaction IDs for flows** - Track user journeys or operations from start to finish
3. **Log at the right level** - Use debug for detailed info, info for normal events, warn for issues, error for failures
4. **Protect sensitive data** - Don't log passwords, full credit card numbers, etc.
5. **Be consistent** - Use similar naming conventions across the application

## Deployment Considerations

- In production, `debug` level logs are automatically suppressed
- For security reasons, consider filtering sensitive data before it reaches logging systems
- Consider using a dedicated logging service for production (e.g., Sentry, LogRocket) 