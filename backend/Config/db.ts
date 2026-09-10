import mongoose from 'mongoose';

let isConnecting = false;
let eventListenersConfigured = false;

function setupEventListeners() {
  if (eventListenersConfigured) return;
  eventListenersConfigured = true;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected -> ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected. Will auto-reconnect when MongoDB service is available.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected successfully.');
  });
}

/**
 * Asynchronously attempts connection to MongoDB.
 * If MongoDB is down, retries every `retryIntervalMs` without crashing the Express server.
 */
export async function connectDBWithRetry(
  uri: string = 'mongodb://127.0.0.1:27017/trao',
  retryIntervalMs: number = 3000
) {
  setupEventListeners();

  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;

  async function tryConnect() {
    try {
      console.log(`[MongoDB] Attempting connection to ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      isConnecting = false;
    } catch (err: any) {
      isConnecting = false;
      console.warn(`[MongoDB] Connection failed (${err.message}). Retrying in ${retryIntervalMs / 1000}s...`);
      setTimeout(tryConnect, retryIntervalMs);
    }
  }

  await tryConnect();
}

export const connectDB = connectDBWithRetry;
