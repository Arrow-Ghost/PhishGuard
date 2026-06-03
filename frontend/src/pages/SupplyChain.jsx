import React, { useState } from 'react';
import { 
  PackageSearch, 
  Terminal as TermIcon, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle,
  FileCode,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function SupplyChain() {
  // A realistic, seeded package.json structure demonstrating our scanner features
  const SAMPLE_PACKAGE_JSON = `{
  "name": "my-secure-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "reactt": "^18.2.0",
    "axios": "^1.6.7",
    "moment": "^2.29.4",
    "request": "^2.88.2",
    "minimist": "1.2.5"
  }
}`;

  const [packageInput, setPackageInput] = useState(SAMPLE_PACKAGE_JSON);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const runAudit = () => {
    setScanning(true);
    setScanError('');
    setScanResult(null);

    // Simulate cyber telemetry scanning delay for premium presenter experience
    setTimeout(() => {
      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageJson: packageInput })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => { throw new Error(data.error || 'Malformatted JSON package config.'); });
          }
          return res.json();
        })
        .then(data => {
          setScanResult(data);
          setScanning(false);
        })
        .catch(err => {
          setScanError(err.message);
          setScanning(false);
        });
    }, 1200);
  };

  const resetScanner = () => {
    setPackageInput(SAMPLE_PACKAGE_JSON);
    setScanResult(null);
    setScanError('');
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'critical': return 'text-cyber-danger bg-cyber-danger/10 border-cyber-danger/30';
      case 'warning': return 'text-cyber-warning bg-cyber-warning/10 border-cyber-warning/30';
      case 'safe':
      default: return 'text-cyber-success bg-cyber-success/10 border-cyber-success/30';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-6rem)] overflow-y-auto pr-2 select-none">
      
      {/* Code Editor Panel */}
      <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-full min-h-[450px]">
        <div className="flex justify-between items-start mb-4 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyber-primary/10 rounded-lg text-cyber-primary">
              <FileCode className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-100">
                Dependency Config Manifest
              </h2>
              <p className="text-[11px] text-slate-400">
                Paste your package.json dependencies list below to scan for risks
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetScanner}
              disabled={scanning}
              className="p-1.5 rounded border border-cyber-border/40 text-slate-400 hover:text-slate-100 hover:border-slate-500 disabled:opacity-50 transition-all"
              title="Reset Sample code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={runAudit}
              disabled={scanning || !packageInput.trim()}
              className="px-4 py-1.5 rounded bg-cyber-primary hover:bg-indigo-700 text-white font-sans text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3 fill-white" />
              {scanning ? 'Auditing...' : 'Audit Manifest'}
            </button>
          </div>
        </div>

        {/* JSON Edit Terminal Window */}
        <div className="flex-1 relative rounded-lg border border-cyber-border/30 overflow-hidden font-mono text-xs">
          <textarea
            value={packageInput}
            onChange={(e) => setPackageInput(e.target.value)}
            disabled={scanning}
            className="w-full h-full bg-[#0d1117] text-slate-200 p-4 outline-none resize-none font-mono focus:border-cyber-primary/40 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Analysis Results Dashboard */}
      <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-full min-h-[450px]">
        {scanning ? (
          /* High-Fidelity Scanning Animation */
          <div className="flex-1 flex flex-col items-center justify-center text-cyber-muted space-y-4">
            <Sparkles className="w-12 h-12 text-cyber-primary animate-spin" />
            <div className="space-y-1.5 text-center">
              <span className="font-mono text-xs uppercase font-bold tracking-widest text-cyber-primary glow-text-primary block">Executing Heuristic Scans</span>
              <span className="text-[10px] font-mono block text-cyber-muted/80">Comparing package vectors & checking Levenshtein limits...</span>
            </div>
          </div>
        ) : scanError ? (
          /* Error Box */
          <div className="flex-1 flex flex-col items-center justify-center text-cyber-danger p-6 text-center">
            <AlertTriangle className="w-12 h-12 mb-3 animate-bounce" />
            <span className="font-mono text-sm uppercase font-bold tracking-wider block">Scan Process Interrupted</span>
            <span className="text-[10px] font-mono text-cyber-danger block mt-2 max-w-sm">
              {scanError}
            </span>
          </div>
        ) : scanResult ? (
          /* Dynamic Scan Result Output Dashboard */
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            
            {/* Score Ring / Severity Indicator */}
            <div className="flex justify-between items-center bg-cyber-bg/40 p-4 rounded-lg border border-cyber-border/30 select-none">
              <div>
                <span className="text-[10px] font-mono text-cyber-muted block uppercase">Supply Chain Safety Rating</span>
                <span className={`text-2xl font-display font-black tracking-wide block mt-1 ${
                  scanResult.score >= 60 ? 'text-cyber-danger glow-text-danger' : scanResult.score >= 35 ? 'text-cyber-warning glow-text-warning' : 'text-cyber-success glow-text-success'
                }`}>
                  {100 - scanResult.score}/100
                </span>
                <span className="text-[9px] font-mono text-cyber-muted block uppercase mt-0.5">
                  STATUS: <span className="font-bold text-slate-100">{scanResult.status}</span>
                </span>
              </div>

              <div className="flex gap-4 font-mono text-center">
                <div className="px-3 py-1.5 rounded bg-cyber-danger/10 border border-cyber-danger/25 text-cyber-danger">
                  <div className="font-black text-sm">{scanResult.criticalCount}</div>
                  <div className="text-[8px] uppercase tracking-wider font-bold">Critical</div>
                </div>
                <div className="px-3 py-1.5 rounded bg-cyber-warning/10 border border-cyber-warning/25 text-cyber-warning">
                  <div className="font-black text-sm">{scanResult.warningCount}</div>
                  <div className="text-[8px] uppercase tracking-wider font-bold">Warnings</div>
                </div>
                <div className="px-3 py-1.5 rounded bg-cyber-primary/10 border border-cyber-primary/25 text-cyber-primary">
                  <div className="font-black text-sm">{scanResult.scannedCount}</div>
                  <div className="text-[8px] uppercase tracking-wider font-bold">Scanned</div>
                </div>
              </div>
            </div>

            {/* Scanned packages risk results feed */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase mb-2">
                Identified Risk Vector Details
              </h3>
              
              {scanResult.dependencies.map((dep, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-black text-slate-100">{dep.name}</span>
                      <span className="font-mono text-[10px] text-cyber-muted ml-2">range: {dep.version}</span>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getRiskBadge(dep.category)}`}>
                      {dep.category === 'safe' ? 'Secure' : dep.category.toUpperCase()} // Risk: {dep.riskScore}
                    </span>
                  </div>

                  {dep.findings.length > 0 ? (
                    <div className="space-y-1.5">
                      {dep.findings.map((finding, fIdx) => (
                        <div key={fIdx} className="text-[10px] font-mono p-2 bg-cyber-panel/60 border border-cyber-border/30 rounded text-slate-300 leading-relaxed flex gap-2 items-start">
                          {finding.severity === 'critical' ? (
                            <Flame className="w-3.5 h-3.5 text-cyber-danger shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-cyber-warning shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-100 block">{finding.title}</span>
                            <span className="text-cyber-muted mt-0.5 block leading-relaxed">{finding.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-cyber-success/80 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-cyber-success" />
                      Passed reputational, deprecation, and typosquatting heuristic checks.
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Awaiting Audit Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-cyber-muted p-6 text-center select-none">
            <PackageSearch className="w-12 h-12 text-cyber-muted/30 mb-3 animate-pulse" />
            <span className="font-mono text-sm uppercase font-bold tracking-wider">Awaiting Audit Execution</span>
            <span className="text-[10px] font-mono text-cyber-muted/70 mt-1 max-w-xs">
              Load package configurations and run the audit engine to analyze vulnerabilities.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
