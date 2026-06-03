/**
 * PhishGuard.js - Client Interceptor Script
 * [Shrish's Domain - Security Agent]
 * 
 * Sets up zero-trust wrapper proxies over global network calls (fetch, XHR)
 * and storage vectors (localStorage) to monitor third-party library activity.
 */

(function () {
  const BACKEND_REPORT_URL = 'http://localhost:5001/api/telemetry';
  const SECURE_ORIGINS = [window.location.origin, 'http://localhost:3000', 'http://localhost:5173'];

  // Utility to determine the source script from the call stack
  function getCallingScriptInfo() {
    const err = new Error();
    const stack = err.stack || '';
    const lines = stack.split('\n');
    
    // Line 0 is Error, Line 1 is getCallingScriptInfo, Line 2 is report/interceptor, Line 3+ is caller
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Filter out interceptor script itself
      if (line.includes('interceptor.js') || line.includes('domShield.js')) continue;

      // Extract script URL and line numbers (matches HTTP URLs or webpack/vite resources)
      const match = line.match(/(https?:\/\/[^\s)]+:\d+:\d+)|(anonymous)/);
      if (match) {
        const url = match[1] || 'anonymous';
        // Attempt to extract package name from modern CDN/bundled paths
        let sourcePackage = 'App (Internal)';
        if (url.includes('node_modules')) {
          const parts = url.split('node_modules/');
          sourcePackage = parts[1] ? parts[1].split('/')[0] : 'unknown-package';
        } else if (url.includes('cdnjs.cloudflare.com') || url.includes('unpkg.com') || url.includes('jsdelivr')) {
          const parts = url.split('/');
          // Get the next index after the domain name
          const domainIdx = parts.findIndex(p => p.includes('cdnjs') || p.includes('unpkg') || p.includes('jsdelivr'));
          sourcePackage = parts[domainIdx + 2] || 'external-cdn';
        } else if (url !== 'anonymous') {
          // If it's a dynamic asset path (e.g. /src/components/...)
          const fileMatch = url.match(/\/src\/([^\s?]+)/);
          if (fileMatch) sourcePackage = `src/${fileMatch[1].split(':')[0]}`;
        }
        return { sourcePackage, url, stack: stack.trim() };
      }
    }
    return { sourcePackage: 'System (Global)', url: 'native', stack: 'N/A' };
  }

  // Sends logged actions safely to the monitoring service without recursive loops
  function logEvent(eventData) {
    const payload = {
      timestamp: new Date().toISOString(),
      sourcePackage: eventData.sourcePackage || 'unknown',
      callerUrl: eventData.callerUrl || 'native',
      action: eventData.action,
      details: eventData.details || '',
      status: eventData.status || 'ALLOWED',
      severity: eventData.severity || 'info',
      stack: eventData.stack || ''
    };

    // Use navigator.sendBeacon when window is unloading, otherwise standard fetch
    // We bypass the interceptor for this specific fetch call to avoid infinite loops
    const rawFetch = window.fetch.__originalFetch || window.fetch;
    if (typeof rawFetch === 'function') {
      rawFetch(BACKEND_REPORT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => {
        // Silently capture backend offline states in sandbox
        console.warn('[PhishGuard Agent] Unable to upload telemetry to backend hub.', err.message);
      });
    }
  }

  // 1. Intercept standard window.fetch API
  if (window.fetch && !window.fetch.__originalFetch) {
    const originalFetch = window.fetch;
    
    const fetchProxy = new Proxy(originalFetch, {
      apply(target, thisArg, argumentsList) {
        const [resource, config] = argumentsList;
        const url = typeof resource === 'string' ? resource : (resource.url || '');
        const method = (config && config.method) || 'GET';
        const { sourcePackage, url: callerUrl, stack } = getCallingScriptInfo();

        let severity = 'info';
        let status = 'ALLOWED';
        let action = `Network ${method} Request`;
        let details = `Target: ${url}`;

        // Zero-Trust heuristic rules
        const isExternal = !SECURE_ORIGINS.some(origin => url.startsWith(origin) || url.startsWith('/'));
        const hasSensitiveData = url.includes('cookie') || url.includes('token') || url.includes('key') ||
          (config && config.body && (
            config.body.includes('password') || 
            config.body.includes('cookie') || 
            config.body.includes('token') || 
            config.body.includes('localStorage')
          ));

        if (isExternal) {
          severity = 'warning';
          details += ` [External Domain]`;
          
          if (hasSensitiveData) {
            severity = 'critical';
            status = 'BLOCKED';
            details += ` - Attempted credentials/token leak to untrusted domain!`;
          }
        }

        // Log the event
        logEvent({ sourcePackage, callerUrl, action, details, status, severity, stack });

        // If blocked, return a mock aborted promise response
        if (status === 'BLOCKED') {
          console.error(`[PhishGuard Shiled] Intercepted exfiltration attack from [${sourcePackage}] towards [${url}]. Request was dropped.`);
          return Promise.reject(new TypeError('[PhishGuard Shield] Blocked: Zero-Trust network policy violation.'));
        }

        return Reflect.apply(target, thisArg, argumentsList);
      }
    });

    window.fetch = fetchProxy;
    window.fetch.__originalFetch = originalFetch;
    console.log('[PhishGuard Agent] Window fetch hook active.');
  }

  // 2. Intercept legacy XMLHttpRequest API
  if (window.XMLHttpRequest) {
    const originalOpen = window.XMLHttpRequest.prototype.open;
    const originalSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._phishGuardContext = {
        method,
        url,
        caller: getCallingScriptInfo()
      };
      return originalOpen.apply(this, [method, url, ...args]);
    };

    window.XMLHttpRequest.prototype.send = function (body, ...args) {
      const ctx = this._phishGuardContext || { method: 'UNKNOWN', url: 'unknown', caller: getCallingScriptInfo() };
      const { sourcePackage, url: callerUrl, stack } = ctx.caller;

      let severity = 'info';
      let status = 'ALLOWED';
      let action = `Network XHR ${ctx.method} Request`;
      let details = `Target: ${ctx.url}`;

      const isExternal = !SECURE_ORIGINS.some(origin => ctx.url.startsWith(origin) || ctx.url.startsWith('/'));
      const hasSensitiveData = ctx.url.includes('cookie') || ctx.url.includes('token') || 
        (typeof body === 'string' && (body.includes('password') || body.includes('token')));

      if (isExternal) {
        severity = 'warning';
        details += ` [External Domain]`;
        if (hasSensitiveData) {
          severity = 'critical';
          status = 'BLOCKED';
          details += ` - Dynamic data harvesting detected!`;
        }
      }

      logEvent({ sourcePackage, callerUrl, action, details, status, severity, stack });

      if (status === 'BLOCKED') {
        console.error(`[PhishGuard Shield] Terminating XHR exfiltration channel from [${sourcePackage}]`);
        throw new Error('[PhishGuard Shield] Network exfiltration is blocked by sandbox runtime.');
      }

      return originalSend.apply(this, [body, ...args]);
    };

    console.log('[PhishGuard Agent] XMLHttpRequest hook active.');
  }

  // 3. Intercept sensitive LocalStorage access
  if (window.localStorage) {
    const originalSetItem = window.localStorage.setItem;
    
    window.localStorage.setItem = new Proxy(originalSetItem, {
      apply(target, thisArg, argumentsList) {
        const [key, value] = argumentsList;
        const { sourcePackage, url: callerUrl, stack } = getCallingScriptInfo();

        let severity = 'info';
        let action = 'Write Storage';
        let details = `Key: ${key} (Value length: ${value ? value.length : 0})`;
        let status = 'ALLOWED';

        // Block suspicious libraries reading/writing JWT tokens or cookies dynamically
        const isSuspiciousPackage = sourcePackage !== 'App (Internal)' && sourcePackage !== 'System (Global)';
        const isAuthKey = key.toLowerCase().includes('token') || key.toLowerCase().includes('jwt') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('cookie');

        if (isSuspiciousPackage && isAuthKey) {
          severity = 'warning';
          details += ` - Suspicious third-party package [${sourcePackage}] writing authentication details directly.`;
        }

        logEvent({ sourcePackage, callerUrl, action, details, status, severity, stack });
        return Reflect.apply(target, thisArg, argumentsList);
      }
    });

    console.log('[PhishGuard Agent] LocalStorage storage proxy active.');
  }
})();
