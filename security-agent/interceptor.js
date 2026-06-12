/**
 * PhishGuard.js - Client Interceptor Script
 * 
 * Sets up zero-trust wrapper proxies over global network calls (fetch)
 * and storage writes to monitor, measure overhead, and enforce security policies.
 */

(function () {
  const BACKEND_WS_URL = 'ws://localhost:5001';
  let ws;

  // Initialize native client WebSocket connection to backend pipeline
  function connectWebSocket() {
    ws = new WebSocket(BACKEND_WS_URL);

    ws.onopen = () => {
      console.log('[PhishGuard Agent] Secure WebSocket channel established.');
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connectWebSocket();

  // Helper to format local time string matching "HH:MM:SS PM/AM"
  function getFormattedLocalTime() {
    const date = new Date();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  }

  // Helper to determine the source script from the call stack
  function getCallerContext() {
    try {
      const err = new Error();
      const stack = err.stack || '';
      const lines = stack.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('interceptor.js')) continue;

        const match = line.match(/\/src\/([^\s?):]+)/);
        if (match) {
          let path = match[1];
          const dotIdx = path.lastIndexOf('.');
          if (dotIdx !== -1) {
            path = path.substring(0, dotIdx);
          }
          return `src/${path}`;
        }
      }
    } catch (e) {
      // Fallback
    }
    return 'src/pages/Sandbox';
  }

  function sendTelemetry(payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  // ─── Network Interception Core ─────────────────────────────────────────────
  if (window.fetch && !window.fetch.__originalFetch) {
    const originalFetch = window.fetch;

    const fetchProxy = new Proxy(originalFetch, {
      apply(target, thisArg, argumentsList) {
        const startTime = performance.now();
        const [resource] = argumentsList;
        const urlString = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');

        const isSafeTarget = urlString.includes('api.github.com/safe-endpoint') || urlString.endsWith('/api/health');
        const isMaliciousTarget = urlString.includes('malicious-domain.com');

        if (isSafeTarget) {
          // Simulator 1: Standard fetch request to safe endpoint
          const latencyMs = parseFloat((performance.now() - startTime).toFixed(4));
          sendTelemetry({
            timestamp: getFormattedLocalTime(),
            callerContext: getCallerContext(),
            action: 'Network FETCH Request',
            target: urlString,
            severity: 'INFO',
            status: 'ALLOWED',
            latencyMs: latencyMs
          });
          return Reflect.apply(target, thisArg, argumentsList);
        }

        if (isMaliciousTarget) {
          // Simulator 2: Network Exfiltration Attempt
          const latencyMs = parseFloat((performance.now() - startTime).toFixed(4));
          sendTelemetry({
            timestamp: getFormattedLocalTime(),
            callerContext: getCallerContext(),
            action: 'Network FETCH Request',
            target: urlString,
            severity: 'CRITICAL',
            status: 'BLOCKED',
            latencyMs: latencyMs
          });
          return Promise.reject(new Error("PhishGuard Security Violation: Request Blocked."));
        }

        // Default pass-through behavior for other standard fetches (e.g. backend api)
        return Reflect.apply(target, thisArg, argumentsList);
      }
    });

    window.fetch = fetchProxy;
    window.fetch.__originalFetch = originalFetch;
    console.log('[PhishGuard Agent] Window fetch proxy wrapper hook active.');
  }

  // ─── LocalStorage & SessionStorage Interception Core ───────────────────────
  const HIGH_RISK_KEYS = ['session_token', 'auth_key', 'secret', 'auth_token'];

  function monitorStorageWrite(storageType, originalSetItem) {
    return function (key, value) {
      const startTime = performance.now();
      const isHighRisk = HIGH_RISK_KEYS.some(k => key.toLowerCase().includes(k));

      // Simulator 3: Storage Tampering is a WARNING, allow original storage method to complete naturally
      const result = originalSetItem.apply(this, arguments);

      const latencyMs = parseFloat((performance.now() - startTime).toFixed(4));
      const status = isHighRisk ? 'WARNING' : 'ALLOWED';
      const severity = isHighRisk ? 'WARNING' : 'INFO';

      sendTelemetry({
        timestamp: getFormattedLocalTime(),
        callerContext: getCallerContext(),
        action: 'Sensitive Storage Write',
        target: `${storageType}: ${key}`,
        status: status,
        severity: severity,
        latencyMs: latencyMs
      });

      return result;
    };
  }

  try {
    if (window.localStorage && !window.__phishGuardLocalStorageHooked) {
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = monitorStorageWrite('localStorage', originalSetItem);
      window.__phishGuardLocalStorageHooked = true;
      console.log('[PhishGuard Agent] localStorage proxy wrapper hook active.');
    }
  } catch (e) {
    console.error('[PhishGuard Agent] Failed to hook localStorage:', e.message);
  }

  try {
    if (window.sessionStorage && !window.__phishGuardSessionStorageHooked) {
      const originalSetItem = window.sessionStorage.setItem;
      window.sessionStorage.setItem = monitorStorageWrite('sessionStorage', originalSetItem);
      window.__phishGuardSessionStorageHooked = true;
      console.log('[PhishGuard Agent] sessionStorage proxy wrapper hook active.');
    }
  } catch (e) {
    console.error('[PhishGuard Agent] Failed to hook sessionStorage:', e.message);
  }
})();
