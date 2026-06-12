# 🛡️ PhishGuard.js

> **Zero-Trust Web Dependency Security Interception & Supply Chain Defense Framework**

PhishGuard.js is an advanced security framework designed to protect client-side web applications against compromised third-party dependencies, supply chain injections, and runtime data exfiltration. By implementing a **Zero-Trust** security architecture directly in the browser and scanning dependencies for static hazards, PhishGuard.js stops malicious actions before they can leak sensitive data.

---

## 🔍 Table of Contents
1. [About the Project](#-about-the-project)
2. [Key Architecture & Features](#-key-architecture--features)
3. [Project Directory Structure](#-project-directory-structure)
4. [Installation & Dependency Setup](#-installation--dependency-setup)
5. [Running the Application](#-running-the-application)
6. [Interactive Sandbox Playground](#-interactive-sandbox-playground)
7. [Under the Hood: Technical Details](#-under-the-hood-technical-details)

---

## 💡 About the Project

Modern web applications pull in hundreds of external dependencies (via CDN or npm packages). If one of these dependencies gets compromised (e.g., via credential theft, typosquatting, or malicious upgrades), an attacker can execute arbitrary script code in the user's browser, harvest cookies/JWT tokens, or capture credentials. 

**PhishGuard.js** mitigates this runtime supply chain threat through a double layer of defense:
1. **Dynamic Runtime Shields**: Light weight client-side scripts that intercept network calls (`fetch`, `XMLHttpRequest`), storage reads/writes (`localStorage`), and DOM modifications in real-time, blocking unauthorized external data transfers and malicious script injection.
2. **Static Supply Chain Scanning**: A vulnerability analyzer that inspects `package.json` configurations for typosquatting attempts, deprecations, and known vulnerabilities (CVEs).

Telemetry events are streamed in real-time via WebSockets to a futuristic **Security Operations Center (SOC) Dashboard** for immediate observation and analysis.

---

## 🚀 Key Architecture & Features

### 1. Client-Side Security Agent (`/security-agent`)
*   **Zero-Trust Proxy Hooking (`interceptor.js`)**: Wraps global web APIs using JavaScript Proxies. Automatically blocks network requests attempting to exfiltrate cookies or tokens to unauthorized cross-origin domains.
*   **DOM Injection Shield (`domShield.js`)**: Uses a `MutationObserver` to watch element additions in real-time. Automatically isolates and removes dynamically inserted `<script>` tags referencing blocked domain registries, and flags obfuscated or encoded inline scripts.

### 2. Monitoring & Analytics Hub (`/backend`)
*   **Express API & WebSocket server**: Serves as the central repository for security logs, receiving JSON telemetry reports from active browser instances and immediately broadcasting them.
*   **Static Risk Analyzer (`parser.js`)**: 
    *   **Typosquatting Detector**: Computes the Levenshtein distance of package names against standard React/Node libraries to catch packages trying to spoof popular dependencies (e.g., `reect` instead of `react`).
    *   **Vulnerability Database**: Matches versions against a catalog of mock CVEs (such as Prototype Pollution in `lodash` or malicious payload runs in `ua-parser-js`).
    *   **Deprecation Scanner**: Flags legacy libraries (like `request` or `moment`) and supplies recommendations for modern alternatives.

### 3. Cyber-Themed SOC Dashboard (`/frontend`)
*   Built with **React**, **Vite**, and **Tailwind CSS** featuring custom visual aesthetics like dark cyber-themed glassmorphic panels and an overlay matrix scan line.
*   **Real-time Event Log**: Instantly renders blocked and flagged telemetry logs via active WebSocket client.
*   **Supply Chain Auditor**: Paste or upload `package.json` manifests to generate dynamic security dashboards, showing categorized severity scores.
*   **Interactive Simulation Sandbox**: Trigger actual exploit templates (untrusted fetch, token harvesting, script injection) and observe runtime security intercepts live.

---

## 📁 Project Directory Structure

Below is the layout of the PhishGuard.js codebase:

```
PhishGuard/
├── backend/                  # Express REST API & WebSocket Telemetry Server
│   ├── node_modules/         # Server side dependencies
│   ├── package.json          # Server configuration
│   ├── package-lock.json     # Locked server dependencies
│   ├── parser.js             # Static dependency risk analyzer
│   └── server.js             # Main server logic, memory DB, and WS broadcasting
│
├── frontend/                 # React & Vite Cyber Security Dashboard (SOC)
│   ├── dist/                 # Production bundle output
│   ├── node_modules/         # Client side development packages
│   ├── src/
│   │   ├── components/       # Reusable Dashboard components
│   │   │   ├── LogTable.jsx  # Detailed telemetry inspector
│   │   │   ├── MetricCard.jsx# High-level state counters
│   │   │   ├── Sidebar.jsx   # Futuristic navigation bar
│   │   │   └── ThreatMap.jsx # Interactive mockup threat connection map
│   │   ├── pages/            # Application page containers
│   │   │   ├── Dashboard.jsx # Active monitoring metrics and live streams
│   │   │   ├── Sandbox.jsx   # Live attack simulation panel
│   │   │   └── SupplyChain.jsx# package.json uploader and security analyzer
│   │   ├── App.jsx           # Root layout & WebSocket connection layer
│   │   ├── index.css         # Styling system configuration
│   │   └── main.jsx          # Vite React execution bootstrap
│   ├── package.json          # Frontend build configurations
│   ├── postcss.config.js     # PostCSS configurations
│   ├── tailwind.config.js    # Tailwind layout utility configurations
│   └── vite.config.js        # React build tool adjustments
│
├── security-agent/           # Zero-Trust script wrappers (Client Security Agent)
│   ├── domShield.js          # DOM MutationObserver protection
│   └── interceptor.js        # Network API proxy & localStorage interceptor
│
├── package.json              # Root workspace management
└── package-lock.json         # Workspace package lock file
```

---

## 🛠️ Installation & Dependency Setup

The project relies on **Node.js** (v16+ recommended) and **npm**.

For convenience, a **Root Workspace configuration** is included in the base folder. You can install all project dependencies (root, backend, and frontend) with a single command.

1.  **Clone or navigate** to the project root directory:
    ```bash
    cd PhishGuard
    ```

2.  **Run the automated setup script**:
    ```bash
    npm run setup
    ```
    *(This runs `npm install` for the workspace manager, followed by `npm install` inside the `/backend` and `/frontend` subdirectories).*

---

## ⚙️ Running the Application

You can launch both the **Backend Telemetry Hub** and the **Frontend SOC Dashboard** simultaneously.

1.  **Start Dev Servers**:
    ```bash
    npm run dev
    ```
    This script runs the `concurrently` utility which fires up:
    *   **Backend Hub**: `http://localhost:5001` (Accepting JSON telemetry payload streams and WebSocket links).
    *   **Frontend Dashboard**: `http://localhost:3000` (Open this in your browser).

### Separate Commands (Alternative)
If you prefer running services in separate terminal windows:

*   **Backend Only**:
    ```bash
    npm run dev:backend
    ```
*   **Frontend Only**:
    ```bash
    npm run dev:frontend
    ```

---

## 🧪 Interactive Sandbox Playground

To verify that client-side interceptors work correctly, open the dashboard in your browser (`http://localhost:3000`) and navigate to the **Sandbox** page. Here you can execute simulated attacks:

1.  **Fetch Internal APIs**: Simulates a standard application network request (`fetch('/api/health')`). It goes through cleanly since the destination is a safe origin.
2.  **Exfiltrate Credentials to Untrusted Domain**: Attempts to transmit cookie data to `http://eval-server.cc`. The `interceptor.js` proxy immediately catches it, marks the request as **BLOCKED**, drops the fetch stream, and broadcasts a critical alert to the backend telemetry pool.
3.  **Store Credentials in LocalStorage**: Attempts to write a raw authentication token block directly. The storage interceptor detects sensitive credential keys (`user_jwt_auth_token`), logs a warning event, but allows it to proceed as long as it isn't being directly exfiltrated.
4.  **Inject Malicious External Script**: Programmatically appends a script tag referring to `raw.githubusercontent.com/.../steal.js`. The DOM Observer in `domShield.js` intercepts the mutation event, sets the type to `text/security-blocked`, removes the node, and logs a critical event.

---

## 🛠️ Under the Hood: Technical Details

### Proxy Interception Heuristics
In `security-agent/interceptor.js`, the network request scanner applies the following zero-trust evaluation checks:
```javascript
const isExternal = !SECURE_ORIGINS.some(origin => url.startsWith(origin) || url.startsWith('/'));
const hasSensitiveData = url.includes('cookie') || url.includes('token') || url.includes('key') ||
  (config && config.body && (
    config.body.includes('password') || 
    config.body.includes('cookie') || 
    config.body.includes('token')
  ));

if (isExternal && hasSensitiveData) {
  // Block and log critical exfiltration event!
}
```

### Mutation Observer Check
In `security-agent/domShield.js`, elements are inspected dynamically before execution:
```javascript
const isMaliciousDomain = BLOCKED_DOMAINS.some(domain => src.includes(domain));
if (isMaliciousDomain) {
  node.type = 'text/security-blocked';
  node.remove();
  throw new Error('Blocked: reputation check failed.');
}
```
