// Utility functions for error handling and state management

export type ErrorType =
  | 'network'
  | 'unauthorized'
  | 'not_found'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string | number;
}

export function createError(
  type: ErrorType,
  message: string,
  details?: string,
  code?: string | number
): AppError {
  return {
    type,
    message,
    details,
    code,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('offline')
    );
  }
  return false;
}

export function handleApiError(error: unknown): AppError {
  if (isNetworkError(error)) {
    return createError(
      'network',
      'Unable to connect to the server',
      getErrorMessage(error)
    );
  }

  if (error instanceof Error) {
    if (
      error.message.includes('401') ||
      error.message.includes('unauthorized')
    ) {
      return createError(
        'unauthorized',
        'You are not authorized to perform this action',
        error.message
      );
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return createError(
        'not_found',
        'The requested resource was not found',
        error.message
      );
    }
    if (error.message.includes('400') || error.message.includes('validation')) {
      return createError('validation', 'Invalid data provided', error.message);
    }
    if (error.message.includes('500') || error.message.includes('server')) {
      return createError('server', 'Server error occurred', error.message);
    }
  }

  return createError('unknown', getErrorMessage(error));
}

// Hook for managing error states
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    const appError = handleApiError(error);
    console.error('Application error:', appError);
    return appError;
  };

  const retryOperation = async (
    operation: () => Promise<any>,
    maxRetries = 3
  ) => {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
        }
      }
    }

    throw lastError;
  };

  return { handleError, retryOperation };
}
