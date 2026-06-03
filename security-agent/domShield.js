/**
 * PhishGuard.js - DOM Shield Interceptor
 * [Shrish's Domain - Security Agent]
 * 
 * Uses the MutationObserver API to scan the DOM in real-time for suspicious,
 * dynamically injected scripts, tag modifications, or iframe manipulation vectors.
 */

(function () {
  const BACKEND_REPORT_URL = 'http://localhost:5001/api/telemetry';
  
  // High-risk external content delivery roots or dynamic script delivery sources
  const BLOCKED_DOMAINS = [
    'raw.githubusercontent.com', // Common vector for raw script host bypasses
    'pastebin.com',
    'eval-server.cc',
    'suspicious-scripts.biz',
    'temp-hosting.net'
  ];

  const ALLOWED_CDN_PREFIXES = [
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://esm.run'
  ];

  function logDomAlert(eventData) {
    const payload = {
      timestamp: new Date().toISOString(),
      sourcePackage: eventData.sourcePackage || 'Dynamic Injector',
      callerUrl: eventData.callerUrl || 'document.body',
      action: eventData.action,
      details: eventData.details || '',
      status: eventData.status || 'ALLOWED',
      severity: eventData.severity || 'info',
      stack: eventData.stack || ''
    };

    const rawFetch = window.fetch.__originalFetch || window.fetch;
    if (typeof rawFetch === 'function') {
      rawFetch(BACKEND_REPORT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => {
        // Suppress logs if logging endpoint is temporarily unresponsive
      });
    }
  }

  // Scan a script node for structural policy violations
  function evaluateScriptNode(node) {
    if (!node || node.tagName !== 'SCRIPT') return;

    const src = node.getAttribute('src') || '';
    const content = node.textContent || '';
    let status = 'ALLOWED';
    let severity = 'info';
    let details = '';

    // Action Classification
    const action = src ? 'Load Dynamic Script' : 'Execute Inline Script';

    if (src) {
      details = `Source: ${src}`;
      // Rule 1: Evaluate domain against known malicious host list
      const isMaliciousDomain = BLOCKED_DOMAINS.some(domain => src.includes(domain));
      if (isMaliciousDomain) {
        status = 'BLOCKED';
        severity = 'critical';
        details += ' - Direct match against blocked domain registry!';
      }

      // Rule 2: Evaluate third-party script not loaded from vetted CDN or same-origin
      const isSameOrigin = src.startsWith('/') || src.startsWith(window.location.origin);
      const isApprovedCDN = ALLOWED_CDN_PREFIXES.some(prefix => src.startsWith(prefix));

      if (!isSameOrigin && !isApprovedCDN && status !== 'BLOCKED') {
        status = 'FLAGGED';
        severity = 'warning';
        details += ' - Loaded from unverified cross-origin hosting CDN.';
      }
    } else {
      // Inline Script Scanners
      const snippet = content.substring(0, 100) + (content.length > 100 ? '...' : '');
      details = `Inline Content: "${snippet}"`;

      // Rule 3: Detect base64 encoding or obfuscation strings inside inline script tags
      const hasObfuscation = /eval\(/i.test(content) || 
                             /atob\(/i.test(content) || 
                             /_0x[a-f0-9]+/i.test(content) ||
                             /\\x[a-f0-9]{2}/i.test(content);
      
      if (hasObfuscation) {
        status = 'FLAGGED';
        severity = 'warning';
        details += ' - Inline script shows high-density patterns of dynamic code encoding/obfuscation.';
      }
    }

    // Log telemetry to hub
    logDomAlert({
      sourcePackage: 'DOM Engine',
      callerUrl: window.location.href,
      action,
      details,
      status,
      severity,
      stack: new Error().stack || ''
    });

    // Enforcement: Terminate dynamic script elements if blocked
    if (status === 'BLOCKED') {
      console.error(`[PhishGuard Shield] Intercepted and blocked suspicious script loading from: ${src}`);
      
      // Stop the script from executing by setting invalid type and deleting it
      node.type = 'text/security-blocked';
      node.remove();
      
      // Prevent further evaluation
      throw new Error(`[PhishGuard Shield] Execution blocked: ${src} fails domain reputation policies.`);
    }
  }

  // Deploys the MutationObserver onto the document body/head
  function initObserver() {
    const targetNode = document.documentElement;
    const config = { childList: true, subtree: true };

    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check for direct script node additions
            if (node.tagName === 'SCRIPT') {
              evaluateScriptNode(node);
            }
            
            // Check child elements recursively for nested scripts
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
    console.log('[PhishGuard Agent] MutationObserver DOM shield active.');
  }

  // Hook elements as soon as DOM starts rendering
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
