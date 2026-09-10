const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] Uncaught: ${err.stack || err}\n`);
  } catch {}
});

process.on('unhandledRejection', (reason) => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] Rejection: ${reason && reason.stack ? reason.stack : reason}\n`);
  } catch {}
});

// Ignore EPIPE errors on stdout/stderr if background pipes close
process.stdout?.on('error', () => {});
process.stderr?.on('error', () => {});

process.on('exit', (code) => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] PROCESS EXIT WITH CODE: ${code}\n`);
  } catch {}
});

process.on('beforeExit', (code) => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] BEFORE EXIT: ${code}\n`);
  } catch {}
});

process.on('SIGINT', () => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] RECEIVED SIGINT\n`);
  } catch {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  try {
    fs.appendFileSync(path.resolve(__dirname, '../trao_crash.log'), `[${new Date().toISOString()}] RECEIVED SIGTERM\n`);
  } catch {}
  process.exit(0);
});

// Register tsx so that TypeScript files can be required directly in Node.js
try {
  const tsxPath = require.resolve('tsx/cjs', { paths: [__dirname] });
  require(tsxPath);
} catch {
  // Already registered or loaded via --import tsx
}

require(path.resolve(__dirname, 'helpers/ServerCore.ts'));
