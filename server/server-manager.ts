/**
 * Server Manager
 * 
 * This module contains utilities for managing the HTTP server,
 * including error handling, auto-restart, and process monitoring.
 */

import { createServer, Server } from 'http';
import { Express } from 'express';
import { log } from './vite';

// Default port for the application
const DEFAULT_PORT = 5000;

// Create and configure the HTTP server with enhanced handling
export function createHttpServer(app: Express): Server {
  const server = createServer(app);
  
  // Set keep-alive timeout to prevent premature connection closing
  server.keepAliveTimeout = 65000; // 65 seconds (longer than client timeout)
  server.headersTimeout = 66000;   // Set slightly higher than keepAliveTimeout
  
  // Handle server errors
  server.on('error', (error: Error) => {
    const err = error as NodeJS.ErrnoException;
    
    log(`Server error: ${err.message}`, 'server');
    
    // Handle specific error cases
    if (err.code === 'EADDRINUSE') {
      const port = process.env.PORT || DEFAULT_PORT;
      log(`Port ${port} is already in use. Attempting to restart...`, 'server');
      
      // Attempt to restart the server after a short delay
      setTimeout(() => {
        server.close();
        startServer(server, app);
      }, 1000);
    }
  });
  
  // Shut down gracefully on process termination
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      log(`${signal} received. Shutting down gracefully...`, 'server');
      
      // Close the server
      server.close(() => {
        log('Server closed. Process will now exit.', 'server');
        process.exit(0);
      });
      
      // Force close if it takes too long
      setTimeout(() => {
        log('Server forced to close after timeout', 'server');
        process.exit(1);
      }, 10000).unref();
    });
  });
  
  return server;
}

// Start the server with error handling and restart capability
export function startServer(server: Server, app: Express) {
  const port = process.env.PORT || DEFAULT_PORT;
  
  try {
    server.listen({
      port: Number(port),
      host: '0.0.0.0',
      reusePort: true,
    }, () => {
      log(`Server started successfully on port ${port}`, 'server');
    });
  } catch (error: any) {
    log(`Failed to start server: ${error.message}`, 'server');
    
    // Auto-restart after a delay
    setTimeout(() => {
      log('Attempting to restart server...', 'server');
      startServer(server, app);
    }, 5000);
  }
}