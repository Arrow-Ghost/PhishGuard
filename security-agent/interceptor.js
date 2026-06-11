/**
 * PhishGuard.js - Client Interceptor Script
 * 
 * Sets up zero-trust wrapper proxies over global network calls (fetch)
 * to monitor, measure security processing overhead, and block malicious network exfiltration.
 */

(function () {
  // Static array of untrusted domains to block
  const UNTRUSTED_DOMAINS = ['malicious-domain.com', 'attacker.com', 'crypt-miner-helper'];
  const BACKEND_WS_URL = 'ws://localhost:5001';

  let ws;

  // Initialize native client WebSocket connection to backend pipeline
  function connectWebSocket() {
    ws = new WebSocket(BACKEND_WS_URL);

    ws.onopen = () => {
      console.log('[PhishGuard Agent] Secure WebSocket channel established.');
    };

    ws.onclose = () => {
      // Reconnect after 3 seconds if connection is lost
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connectWebSocket();

  // Helper to format local time string matching "HH:MM:SS PM/AM" or "HH:MM:SS AM/PM"
  function getFormattedLocalTime() {
    const date = new Date();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  }

  // Helper to determine the source script from the call stack
  function getCallerContext() {
    try {
      const err = new Error();
      const stack = err.stack || '';
      const lines = stack.split('\n');
      
      // Look for first stack line referencing /src/ to locate the frontend page/component caller
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('interceptor.js')) continue;

        const match = line.match(/\/src\/([^\s?):]+)/);
        if (match) {
          let path = match[1];
          // Strip file extension to match component/page path format
          const dotIdx = path.lastIndexOf('.');
          if (dotIdx !== -1) {
            path = path.substring(0, dotIdx);
          }
          return `src/${path}`;
        }
      }
    } catch (e) {
      // Fallback in case stack trace parsing fails
    }
    return 'src/pages/Sandbox';
  }

  // Network Interception Core - Wrap global fetch with Proxy
  if (window.fetch && !window.fetch.__originalFetch) {
    const originalFetch = window.fetch;

    const fetchProxy = new Proxy(originalFetch, {
      apply(target, thisArg, argumentsList) {
        // Start high-precision timer immediately
        const startTime = performance.now();

        const [resource] = argumentsList;
        const urlString = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');

        // Calculate overhead execution time right before evaluating safety rules
        const overheadTime = performance.now() - startTime;
        const latencyMs = parseFloat(overheadTime.toFixed(4));

        // Evaluate safety rules
        const isBlacklisted = UNTRUSTED_DOMAINS.some(domain => urlString.includes(domain));

        if (!isBlacklisted) {
          // If URL is safe, allow the network call to proceed uninterrupted
          return Reflect.apply(target, thisArg, argumentsList);
        }

        // If URL is blacklisted, actively block request and report telemetry
        const payload = {
          timestamp: getFormattedLocalTime(),
          callerContext: getCallerContext(),
          action: 'Network FETCH Request',
          target: urlString,
          severity: 'CRITICAL',
          status: 'BLOCKED',
          latencyMs: latencyMs
        };

        // Send JSON payload instantly over WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        } else {
          console.warn('[PhishGuard Agent] WebSocket channel offline, telemetry payload queued.');
        }

        // Return rejected promise to terminate the packet inside the browser runtime
        return Promise.reject(new Error("PhishGuard Security Violation: Request Blocked."));
      }
    });

    window.fetch = fetchProxy;
    window.fetch.__originalFetch = originalFetch;
    console.log('[PhishGuard Agent] Window fetch proxy wrapper hook active.');
  }
})();
