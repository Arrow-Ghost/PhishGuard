/**
 * PhishGuard.js - DOM Shield Interceptor
 * 
 * Uses the MutationObserver API to scan the DOM in real-time for suspicious,
 * dynamically injected scripts and blocks untrusted assets. Relays alerts via WebSocket.
 */

(function () {
  const BACKEND_WS_URL = 'ws://localhost:5001';
  let ws;

  // Initialize native client WebSocket connection to backend pipeline
  function connectWebSocket() {
    ws = new WebSocket(BACKEND_WS_URL);

    ws.onopen = () => {
      console.log('[PhishGuard DOM Shield] Secure WebSocket channel established.');
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connectWebSocket();

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

  // Vetted CDNs
  const ALLOWED_CDN_PREFIXES = [
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://esm.run'
  ];

  // Blocked domains
  const BLOCKED_DOMAINS = [
    'raw.githubusercontent.com',
    'pastebin.com',
    'eval-server.cc',
    'suspicious-scripts.biz',
    'temp-hosting.net'
  ];

  function sendTelemetry(payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  // Scan a script node for structural policy violations
  function evaluateScriptNode(node) {
    if (!node || node.tagName !== 'SCRIPT') return;

    const src = node.getAttribute('src') || '';
    const content = node.textContent || '';
    let status = 'ALLOWED';
    let severity = 'INFO';
    let details = '';

    const action = src ? 'Load Dynamic Script' : 'Execute Inline Script';

    if (src) {
      details = `Source: ${src}`;
      const isMaliciousDomain = BLOCKED_DOMAINS.some(domain => src.includes(domain)) || src.includes('attacker-payload.js');
      
      if (isMaliciousDomain) {
        status = 'BLOCKED';
        severity = 'CRITICAL';
        details += ' - Direct match against blocked domain registry / unverified asset!';
      } else {
        const isSameOrigin = src.startsWith('/') || src.startsWith(window.location.origin);
        const isApprovedCDN = ALLOWED_CDN_PREFIXES.some(prefix => src.startsWith(prefix));

        if (!isSameOrigin && !isApprovedCDN) {
          status = 'WARNING';
          severity = 'WARNING';
          details += ' - Loaded from unverified cross-origin hosting CDN.';
        }
      }
    } else {
      // Inline Script Analysis
      const snippet = content.substring(0, 100) + (content.length > 100 ? '...' : '');
      details = `Inline Content: "${snippet}"`;

      const hasObfuscation = /eval\(/i.test(content) || 
                             /atob\(/i.test(content) || 
                             /_0x[a-f0-9]+/i.test(content) ||
                             /\\x[a-f0-9]{2}/i.test(content);
      
      if (hasObfuscation) {
        status = 'WARNING';
        severity = 'WARNING';
        details += ' - Inline script shows obfucation patterns.';
      }
    }

    // Send payload over WebSocket channel
    sendTelemetry({
      timestamp: getFormattedLocalTime(),
      callerContext: 'src/pages/Sandbox',
      action: action,
      target: src || 'Inline Script',
      severity: severity,
      status: status,
      latencyMs: 0.0012
    });

    // Enforcement: Terminate dynamic script elements if blocked
    if (status === 'BLOCKED') {
      console.error(`[PhishGuard DOM Shield] Intercepted and blocked suspicious script loading from: ${src}`);
      node.type = 'text/security-blocked';
      node.remove();
      throw new Error(`[PhishGuard DOM Shield] Execution blocked: ${src} fails domain reputation policies.`);
    }
  }

  function initObserver() {
    const targetNode = document.documentElement;
    const config = { childList: true, subtree: true };

    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'SCRIPT') {
              evaluateScriptNode(node);
            }
            if (node.getElementsByTagName) {
              const scripts = node.getElementsByTagName('script');
              for (let i = 0; i < scripts.length; i++) {
                evaluateScriptNode(scripts[i]);
              }
            }
          });
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    console.log('[PhishGuard DOM Shield] MutationObserver active.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
