/**
 * PhishGuard.js - Backend Telemetry Hub
 * [Aishani's Domain - Backend Service]
 * 
 * Sets up Express routes and a real-time WebSockets connection layer to accept
 * telemetry logs from browser interceptors and broadcast them instantly.
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { scanPackageJson } = require('./parser');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory database of active security alerts (for initial UI render)
const activeLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    sourcePackage: 'src/components/Navbar.jsx',
    callerUrl: 'http://localhost:5173/src/components/Navbar.jsx',
    action: 'Network GET Request',
    details: 'Target: http://localhost:5173/assets/logo.png',
    status: 'ALLOWED',
    severity: 'info',
    stack: 'Error\n    at getCallingScriptInfo (interceptor.js:15:15)\n    at fetch (interceptor.js:70:30)'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    sourcePackage: 'moment-timezone',
    callerUrl: 'https://unpkg.com/moment-timezone@0.5.43/builds/moment-timezone-with-data.min.js',
    action: 'Write Storage',
    details: 'Key: pg_cached_tz (Value length: 48) - Legacy dependency timezone initialization.',
    status: 'ALLOWED',
    severity: 'info',
    stack: 'Error\n    at Object.setItem (interceptor.js:120:20)'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
    sourcePackage: 'lodash',
    callerUrl: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
    action: 'Network POST Request',
    details: 'Target: http://untrusted-analytics-tracker.cc/collect [External Domain]',
    status: 'ALLOWED',
    severity: 'warning',
    stack: 'Error\n    at lodash.js:24:28\n    at getCallingScriptInfo (interceptor.js:15:15)'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    sourcePackage: 'DOM Engine',
    callerUrl: 'http://localhost:5173/sandbox',
    action: 'Load Dynamic Script',
    details: 'Source: https://raw.githubusercontent.com/malicious-actor/exploit/main/steal.js - Direct match against blocked domain registry!',
    status: 'BLOCKED',
    severity: 'critical',
    stack: 'Error\n    at evaluateScriptNode (domShield.js:45:15)'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    sourcePackage: 'crypt-miner-helper',
    callerUrl: 'https://suspicious-scripts.biz/miner.js',
    action: 'Network POST Request',
    details: 'Target: http://eval-server.cc/exfiltrate?cookie=session_token_xyz - Attempted credentials/token leak to untrusted domain!',
    status: 'BLOCKED',
    severity: 'critical',
    stack: 'Error\n    at fetch (interceptor.js:80:35)'
  }
];

// Create HTTP & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Connection pool
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[PhishGuard Hub] Client connected to live events (${clients.size} total active users)`);
  
  // Seed clients with existing security history upon handshake
  ws.send(JSON.stringify({ type: 'SEEDED_LOGS', data: activeLogs }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[PhishGuard Hub] Client disconnected (${clients.size} remaining)`);
  });
});

// Broadcast utilities
function broadcastLog(log) {
  const payload = JSON.stringify({ type: 'NEW_LOG', data: log });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date(), agentsInterconnected: true });
});

// Returns the full list of log telemetry history
app.get('/api/telemetry', (req, res) => {
  res.json(activeLogs);
});

// Endpoint to ingest client interceptor payloads
app.post('/api/telemetry', (req, res) => {
  const { sourcePackage, callerUrl, action, details, status, severity, stack } = req.body;
  
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    sourcePackage: sourcePackage || 'anonymous',
    callerUrl: callerUrl || 'unknown',
    action: action || 'Network Operation',
    details: details || '',
    status: status || 'ALLOWED',
    severity: severity || 'info',
    stack: stack || ''
  };

  // Prepend to active memory queue
  activeLogs.unshift(newLog);
  // Cap history at 150 entries
  if (activeLogs.length > 150) activeLogs.pop();

  // Print nicely in server process stdout
  const color = severity === 'critical' ? '\x1b[31m' : severity === 'warning' ? '\x1b[33m' : '\x1b[32m';
  console.log(`[TELEMETRY] [${newLog.status}] ${color}${newLog.severity.toUpperCase()}\x1b[0m: [${newLog.sourcePackage}] - ${newLog.action} -> ${newLog.details}`);

  // Broadcast to all active developer dashboards
  broadcastLog(newLog);

  res.status(201).json({ success: true, logId: newLog.id });
});

// Dependency Analyzer Scan endpoint
app.post('/api/scan', (req, res) => {
  const { packageJson } = req.body;
  
  if (!packageJson) {
    return res.status(400).json({ error: 'Missing packageJson in request payload.' });
  }

  try {
    let parsedConfig = packageJson;
    if (typeof packageJson === 'string') {
      parsedConfig = JSON.parse(packageJson);
    }
    
    const analysisReport = scanPackageJson(parsedConfig);
    res.json(analysisReport);
  } catch (error) {
    res.status(400).json({ error: `Malformatted JSON specification: ${error.message}` });
  }
});

// Start listening
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  PhishGuard.js Security Operations Center Running`);
  console.log(`📡 Telemetry API endpoint: http://localhost:${PORT}/api/telemetry`);
  console.log(`🔌 WebSocket real-time pool: ws://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
