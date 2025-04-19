import React, { useEffect, useCallback, useState } from 'react';
import Logger from '../lib/logger';

/**
 * Hook to track component lifecycle events
 */
const useComponentLogger = (componentName: string) => {
  const transactionId = React.useRef(Logger.generateTransactionId());
  
  useEffect(() => {
    // Log component mount
    Logger.log(`Component mounted: ${componentName}`, {
      transactionId: transactionId.current,
      context: { componentName }
    });
    
    // Log component unmount
    return () => {
      Logger.log(`Component unmounted: ${componentName}`, {
        transactionId: transactionId.current,
        context: { componentName }
      });
    };
  }, [componentName]);
  
  // Log render
  Logger.log(`Component rendering: ${componentName}`, {
    level: 'debug',
    transactionId: transactionId.current
  });
  
  return transactionId.current;
};

/**
 * Example component that demonstrates how to use Logger
 */
export const LoggingExample: React.FC = () => {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const txId = useComponentLogger('LoggingExample');
  
  // Example of a tracked async operation
  const fetchData = useCallback(async () => {
    return Logger.trackOperation('fetchExampleData', async (opTxId) => {
      try {
        Logger.log('Fetching example data...', {
          context: { timestamp: Date.now() },
          transactionId: opTxId
        });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Randomly throw error to demonstrate error handling
        if (Math.random() > 0.7) {
          throw new Error('Random fetch error');
        }
        
        return { success: true, data: { message: 'Hello from API' } };
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        }
        throw error;
      }
    });
  }, []);
  
  // Example of handling button click with logging
  const handleButtonClick = async () => {
    Logger.log('Button clicked', {
      context: { count },
      transactionId: txId
    });
    
    setCount(prev => prev + 1);
    
    try {
      const result = await fetchData();
      Logger.log('Fetch completed successfully', {
        context: result,
        transactionId: txId
      });
    } catch (err) {
      // Error already logged by trackOperation
      Logger.log('UI handling fetch error', {
        level: 'debug',
        transactionId: txId
      });
    }
  };
  
  // Example of preventing duplicate actions
  const handleSlowOperation = async () => {
    try {
      await Logger.preventDuplicates('slowOperation', async () => {
        Logger.log('Starting slow operation', {
          transactionId: txId
        });
        
        // Simulate long operation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        Logger.log('Slow operation completed', {
          transactionId: txId
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('already in progress')) {
        // This is expected if user clicks multiple times
        Logger.log('Prevented duplicate slow operation', {
          level: 'warn',
          transactionId: txId
        });
      }
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Logging Example</h2>
      
      <div className="space-y-4">
        <div>
          <p>Count: {count}</p>
          {error && (
            <p className="text-red-500 text-sm mt-1">
              Error: {error.message}
            </p>
          )}
        </div>
        
        <div className="space-x-2">
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Logger
          </button>
          
          <button
            onClick={handleSlowOperation}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Slow Operation (Try clicking rapidly)
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Open your console to see the logs.</p>
          <p className="text-xs mt-2">Each operation gets a unique transaction ID that is preserved through the entire flow.</p>
        </div>
      </div>
    </div>
  );
}; 