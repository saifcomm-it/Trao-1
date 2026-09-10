import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDBWithRetry } from '../Config/db';
import { config } from '../Config/env';
import userRoutes from '../routes/userRoutes';
import kitRoutes from '../routes/kitRoutes';
import mockRoutes from '../routes/mockRoutes';

const PORT = config.port || 5000;
const MONGODB_URI = config.mongoUri || 'mongodb://127.0.0.1:27017/trao';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    dbConnected: isDbConnected,
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
    llmConfigured: !!config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here'
  });
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/mock', mockRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Start server immediately, then connect DB in background
const server = app.listen(PORT, () => {
  console.log(`[Trao Backend] API listening on http://localhost:${PORT}/api`);
  // Start DB connection loop asynchronously
  connectDBWithRetry(MONGODB_URI);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`👉 Run: npx kill-port ${PORT}  then try again.\n`);
  } else {
    console.error('[Server Error]', err);
  }
  process.exit(1);
});

export default app;

