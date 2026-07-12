import mongoose from "mongoose";
import { connectDB } from "./connect";

export interface HealthStatus {
  connected: boolean;
  error?: string;
  timestamp: string;
  readyState?: number;
  poolSize?: number;
}

/**
 * Check MongoDB connection health
 */
export async function checkMongoHealth(): Promise<HealthStatus> {
  try {
    const conn = await connectDB();
    const readyState = conn.connection.readyState;
    
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isConnected = readyState === 1;
    
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
      readyState,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Log MongoDB connection status
 */
export function logConnectionStatus(): void {
  const conn = mongoose.connection;
  const states = ["DISCONNECTED", "CONNECTED", "CONNECTING", "DISCONNECTING"];
  console.log(`[MongoDB] Status: ${states[conn.readyState]} (${conn.readyState})`);
  console.log(`[MongoDB] Host: ${conn.host}`);
  console.log(`[MongoDB] DB: ${conn.db?.databaseName || "N/A"}`);
}
