import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const rawGeminiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter((k) => k && k !== 'your_gemini_api_key_here');

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trao',
  geminiApiKey: rawGeminiKeys[0] || '',
  geminiApiKeys: rawGeminiKeys,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  allowLocalUrls: process.env.ALLOW_LOCAL_URLS === 'true' || process.env.NODE_ENV !== 'production',
  jwtSecret: process.env.JWT_SECRET || 'trao-secret-session-key-2026'
};
