/**
 * PhishGuard.js - Backend Telemetry Hub
 * 
 * Combined Express and WebSocket server running on port 5001 to act as
 * an instantaneous streaming relay for real-time security events.
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

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date(), agentsInterconnected: true });
});

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
    const report = scanPackageJson(parsedConfig);
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: `Malformatted JSON specification: ${error.message}` });
  }
});

// HTTP server wrapper
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocket.Server({ server });

// Dynamic connection pool
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[PhishGuard Hub] Client connected. Active clients count: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      // Parse the incoming telemetry package
      const telemetryPayload = JSON.parse(message.toString());
      console.log('[PhishGuard Hub] Received telemetry message:', telemetryPayload);

      // Broadcast raw telemetry payload to all connected clients
      const rawPayload = JSON.stringify(telemetryPayload);
      let sentCount = 0;
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(rawPayload);
          sentCount++;
        }
      }
      console.log(`[PhishGuard Hub] Relayed message to ${sentCount} clients.`);
    } catch (err) {
      console.error('[PhishGuard Hub] Relay Error:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[PhishGuard Hub] Client disconnected. Active clients count: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[PhishGuard Hub] Client connection error: ${err.message}`);
    clients.delete(ws);
  });
});

// Start the server on port 5001
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  PhishGuard.js Security Operations Center Running`);
  console.log(`📡 WebSocket / Express Server: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
