// Network speed detection utility
import { Platform } from 'react-native';

// Simple network detection using fetch latency
async function getNetworkType(): Promise<string> {
  try {
    // Try to detect network type via latency measurement
    const startTime = Date.now();
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    const latency = Date.now() - startTime;
    
    if (latency < 100) return 'wifi';
    if (latency < 500) return 'fast-cellular';
    return 'slow-cellular';
  } catch {
    return 'unknown';
  }
}

export type NetworkSpeed = 'fast' | 'slow' | 'offline';

interface NetworkInfo {
  speed: NetworkSpeed;
  isConnected: boolean;
  type: string | null;
}

let cachedNetworkInfo: NetworkInfo | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5000; // Cache for 5 seconds

/**
 * Detect network speed based on connection type and latency
 */
export async function detectNetworkSpeed(): Promise<NetworkSpeed> {
  try {
    const now = Date.now();
    
    // Return cached result if still valid
    if (cachedNetworkInfo && (now - lastCheckTime) < CACHE_DURATION) {
      return cachedNetworkInfo.speed;
    }

    // Measure actual latency for network speed detection
    let speed: NetworkSpeed = 'slow';
    let isConnected = false;
    let networkType: string | null = null;

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      isConnected = response.ok;
      const latency = Date.now() - startTime;

      // Determine speed based on latency
      if (latency < 200) {
        speed = 'fast';
      } else if (latency < 1000) {
        speed = 'slow';
      } else {
        speed = 'slow';
      }

      // Determine network type based on latency
      networkType = await getNetworkType();
    } catch (error) {
      // If fetch fails, assume offline or very slow
      isConnected = false;
      speed = 'offline';
      networkType = 'unknown';
    }

    cachedNetworkInfo = {
      speed,
      isConnected,
      type: networkType,
    };
    lastCheckTime = now;

    return speed;
  } catch (error) {
    console.error('Network speed detection error:', error);
    return 'slow'; // Default to slow on error
  }
}

/**
 * Get minimum loading time based on network speed
 * This ensures skeleton UI shows for a minimum duration for better UX
 */
export function getMinLoadingTime(speed: NetworkSpeed): number {
  switch (speed) {
    case 'fast':
      return 300; // 300ms minimum for fast connections
    case 'slow':
      return 800; // 800ms minimum for slow connections
    case 'offline':
      return 0; // No minimum for offline
    default:
      return 500;
  }
}

/**
 * Check if network is connected
 */
export async function isNetworkConnected(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    return true;
  } catch (error) {
    return false;
  }
}

