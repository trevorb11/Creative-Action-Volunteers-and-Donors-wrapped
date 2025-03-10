/**
 * Keep-Alive Mechanism
 * 
 * This module sets up a mechanism to periodically ping the server
 * to keep it alive and prevent timeouts.
 */

import { log } from './vite';

// Function to ping the server every 5 minutes
export function setupKeepAlive() {
  const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // Set up a recurring ping to keep the server active
  setInterval(async () => {
    try {
      const response = await fetch('http://localhost:5000/ping');
      if (response.ok) {
        log('Keep-alive ping successful', 'keep-alive');
      } else {
        log(`Keep-alive ping failed with status: ${response.status}`, 'keep-alive');
      }
    } catch (error) {
      log(`Keep-alive ping error: ${error}`, 'keep-alive');
    }
  }, PING_INTERVAL);
  
  log('Keep-alive mechanism enabled', 'keep-alive');
}