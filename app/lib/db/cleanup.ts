import { client } from './drizzle';

// Graceful shutdown handler for database connections
export async function gracefulShutdown() {
  try {
    console.log('Closing database connections...');
    await client.end();
    console.log('Database connections closed successfully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
}