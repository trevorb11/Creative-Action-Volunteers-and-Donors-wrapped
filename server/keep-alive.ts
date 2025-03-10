/**
 * Keep-Alive Mechanism
 * 
 * This module sets up a mechanism to periodically ping the server
 * to keep it alive and prevent timeouts.
 */

import { log } from './vite';
import http from 'http';

/**
 * Sets up a keep-alive mechanism that pings the server
 * regularly to prevent timeouts and inactivity.
 */
export function setupKeepAlive() {
  const PING_INTERVAL = 45 * 1000; // 45 seconds (shorter interval to prevent timeouts)
  const MAX_RETRIES = 3;
  let isServerDown = false;
  
  // Set up a recurring ping to keep the server active
  const intervalId = setInterval(() => {
    pingServer(0);
  }, PING_INTERVAL);
  
  // Function to ping server with retry mechanism
  function pingServer(retryCount: number) {
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path: '/ping',
      method: 'GET',
      timeout: 5000 // 5 second timeout
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          if (isServerDown) {
            log('Server is back online', 'keep-alive');
            isServerDown = false;
          } else {
            log('Keep-alive ping successful', 'keep-alive');
          }
        } else {
          log(`Keep-alive ping returned non-200 status: ${res.statusCode}`, 'keep-alive');
          retryIfNeeded(retryCount);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`Keep-alive ping error: ${error.message}`, 'keep-alive');
      retryIfNeeded(retryCount);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log('Keep-alive ping timed out', 'keep-alive');
      retryIfNeeded(retryCount);
    });
    
    req.end();
  }
  
  // Retry function with exponential backoff
  function retryIfNeeded(retryCount: number) {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      log(`Retrying ping in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`, 'keep-alive');
      
      setTimeout(() => {
        pingServer(retryCount + 1);
      }, delay);
    } else if (!isServerDown) {
      isServerDown = true;
      log('Server appears to be down after multiple retry attempts', 'keep-alive');
      
      // Try to reconnect periodically after failure
      setTimeout(() => {
        log('Attempting to reconnect to server...', 'keep-alive');
        pingServer(0);
      }, 30000); // Try again after 30 seconds
    }
  }
  
  // Additional keep-alive request from outside the server
  // This helps with network activity to keep connections open
  setInterval(() => {
    try {
      // Make a request to an external service to keep network active
      const externalReq = http.request({
        host: 'example.com', 
        path: '/',
        method: 'HEAD',
        timeout: 5000
      });
      externalReq.end();
    } catch (err) {
      // Ignore external ping errors
    }
  }, 4 * 60 * 1000); // Every 4 minutes
  
  // Handle process termination
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    log('Keep-alive mechanism stopped', 'keep-alive');
  });
  
  log('Enhanced keep-alive mechanism enabled', 'keep-alive');
}