import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function ThreatMap({ logs = [] }) {
  // Remove redundancy from the input stream before rendering SVG spoke elements
  const uniqueLogs = logs.filter((log, index, self) =>
    index === self.findIndex((l) => (
      l.timestamp === log.timestamp && l.target === log.target
    ))
  );

  // Static central root node anchored at [350, 250]
  const rootNode = {
    id: 'node-root',
    name: 'PhishGuard App Host',
    type: 'root',
    x: 350,
    y: 250,
    r: 35,
    version: '1.0.0',
    riskScore: 0,
    category: 'safe',
    author: 'Main Developer',
    description: 'The core client execution application compiling all security agents.',
    findings: 'Safe. Client DOM sandboxing hooks active.'
  };

  // Slice logs to latest 6 events to keep graph clean
  const displayLogs = uniqueLogs.slice(0, 6);
  const nodes = [rootNode];
  const links = [];

  // Generate spoke nodes in a perfect circular arrangement around the core
  displayLogs.forEach((log, index) => {
    const angle = (2 * Math.PI * index) / displayLogs.length;
    const radius = 135; // spoke distance
    const x = 350 + radius * Math.cos(angle);
    const y = 250 + radius * Math.sin(angle);
    
    const nodeName = log.callerContext || log.sourcePackage || 'Anonymous Context';
    const isBlocked = log.status === 'BLOCKED';
    const isWarning = log.status === 'WARNING';

    nodes.push({
      id: `node-${log.id || index}`,
      name: nodeName,
      type: 'spoke',
      x,
      y,
      r: 25,
      version: '1.0.0',
      riskScore: isBlocked ? 95 : (isWarning ? 45 : 10),
      category: isBlocked ? 'critical' : (isWarning ? 'warning' : 'safe'),
      author: 'Security Agent',
      description: `Discovered vector: ${log.action || 'Network operation'}. Target: ${log.target || log.details || 'unknown'}.`,
      findings: isBlocked 
        ? 'CRITICAL MITIGATION: Interceptor blocked request execution.' 
        : (isWarning ? 'WARNING FLAG: Sensitive storage override tracked.' : 'Safe transaction permitted by security agent.'),
      logData: log
    });

    links.push({
      source: 'node-root',
      target: `node-${log.id || index}`
    });
  });

  // Keep track of selection by ID to avoid stale reference crashes on logs updates
  const [selectedNodeId, setSelectedNodeId] = useState('node-root');
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || rootNode;

  const getStatusColor = (status) => {
    if (status === 'BLOCKED') return 'stroke-cyber-danger fill-cyber-danger/10';
    if (status === 'WARNING') return 'stroke-cyber-warning fill-cyber-warning/10';
    return 'stroke-cyber-success fill-cyber-success/10';
  };

  const getLineColor = (status) => {
    if (status === 'BLOCKED') return 'stroke-cyber-danger';
    if (status === 'WARNING') return 'stroke-cyber-warning';
    return 'stroke-cyber-success';
  };

  const getInnerSymbol = (status) => {
    if (status === 'BLOCKED') return '🛑';
    if (status === 'WARNING') return '⚠️';
    return '✓';
  };

  return (
    <div className="flex gap-6 h-full items-stretch">
      {/* Visual Workspace Canvas Panel */}
      <div className="flex-1 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col relative min-w-0">
        
        {/* Header details */}
        <div className="flex justify-between items-start mb-4 relative z-10 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20">
              <Network className="w-5 h-5 text-cyber-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base tracking-wider text-slate-100 uppercase">
                Dependency Threat-Vector Map
              </h2>
              <p className="text-[10px] font-mono text-cyber-muted uppercase">
                Active real-time node topology stream
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-success border border-cyber-success/30"></span> ALLOWED</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-warning border border-cyber-warning/30"></span> WARNING</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-danger border border-cyber-danger/30"></span> BLOCKED</span>
          </div>
        </div>

        {/* Dynamic SVG Visual Node canvas graph */}
        <div className="flex-1 bg-cyber-bg/40 rounded-lg border border-cyber-border/30 relative overflow-hidden flex items-center justify-center min-h-[350px]">
          <svg 
            viewBox="0 0 700 500" 
            className="w-full h-full max-w-[650px] relative z-10 select-none"
          >
            {/* Drawing SVG Link Paths */}
            {links.map((link, idx) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              const status = tgtNode.logData?.status || 'ALLOWED';

              return (
                <line
                  key={idx}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  className={`stroke-[2] transition-all duration-300 ${getLineColor(status)}`}
                />
              );
            })}

            {/* Drawing Graph Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isRoot = node.type === 'root';
              const status = isRoot ? 'ROOT' : node.logData?.status;
              
              let strokeClass = isRoot ? 'stroke-cyber-primary' : getStatusColor(status);
              let symbol = isRoot ? 'Core' : getInnerSymbol(status);

              return (
                <g 
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group animate-fadeIn"
                >
                  {/* Selected node highlight indicator */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 4}
                      className={`fill-none stroke-[1.5] stroke-dasharray-[2] ${
                        isRoot ? 'stroke-cyber-primary' : (status === 'BLOCKED' ? 'stroke-cyber-danger' : (status === 'WARNING' ? 'stroke-cyber-warning' : 'stroke-cyber-success'))
                      }`}
                    />
                  )}

                  {/* Primary Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    className={`stroke-[2] fill-[#161b26] transition-all duration-300 ${strokeClass}`}
                  />

                  {/* Inner Icon or Symbol */}
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    className="font-sans text-[10px] font-bold select-none pointer-events-none fill-slate-300"
                  >
                    {symbol}
                  </text>

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + node.r + 14}
                    textAnchor="middle"
                    className="font-sans text-[9px] font-semibold fill-slate-400 pointer-events-none select-none tracking-wide"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side Node Inspector Panel */}
      <div className="w-80 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col shrink-0 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4 border-b border-cyber-border/30 pb-3">
          {selectedNode.type === 'root' ? (
            <CheckCircle className="w-5 h-5 text-cyber-primary" />
          ) : selectedNode.logData?.status === 'BLOCKED' ? (
            <ShieldAlert className="w-5 h-5 text-cyber-danger animate-bounce" />
          ) : selectedNode.logData?.status === 'WARNING' ? (
            <AlertTriangle className="w-5 h-5 text-cyber-warning" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-cyber-success" />
          )}
          <div>
            <h3 className="font-display font-bold text-sm tracking-wider text-slate-100 uppercase truncate max-w-[180px]">
              {selectedNode.name}
            </h3>
            <span className="text-[9px] font-mono text-cyber-muted uppercase block mt-0.5">
              version: {selectedNode.version}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs">
          {selectedNode.type === 'spoke' && selectedNode.logData ? (
            // Spoke node detail view
            <>
              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Telemetry Action</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200 font-bold break-all">
                  {selectedNode.logData.action}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Target Host / Resource</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200 select-all break-all leading-relaxed">
                  {selectedNode.logData.target || selectedNode.logData.details}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Status / Severity</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-300 flex justify-between">
                  <span className={
                    selectedNode.logData.status === 'BLOCKED' ? 'text-cyber-danger font-bold' : 
                    selectedNode.logData.status === 'WARNING' ? 'text-cyber-warning font-bold' : 'text-cyber-success font-bold'
                  }>
                    {selectedNode.logData.status}
                  </span>
                  <span className="text-cyber-muted">{selectedNode.logData.severity || 'INFO'}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Intercept Latency</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-cyan-300 font-bold">
                  {selectedNode.logData.latencyMs != null ? `${selectedNode.logData.latencyMs}ms` : '0ms'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Security Audit Details</div>
                <div className={`p-3 rounded border text-[11px] leading-relaxed ${
                  selectedNode.logData.status === 'BLOCKED' 
                    ? 'bg-cyber-danger/5 border-cyber-danger/30 text-cyber-danger' 
                    : selectedNode.logData.status === 'WARNING' 
                    ? 'bg-cyber-warning/5 border-cyber-warning/30 text-cyber-warning' 
                    : 'bg-cyber-success/5 border-cyber-success/30 text-cyber-success'
                }`}>
                  {selectedNode.findings}
                </div>
              </div>
            </>
          ) : (
            // Core host default view
            <>
              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Node Domain</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200">
                  Local Host Origin
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Publisher & Author</div>
                <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-300">
                  <span className="text-cyber-muted">{selectedNode.author}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Package Scope</div>
                <p className="text-[11px] leading-relaxed text-slate-300 p-2.5 bg-cyber-bg/50 border border-cyber-border/20 rounded">
                  {selectedNode.description}
                </p>
              </div>

              <div>
                <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Security Audit Details</div>
                <div className="p-3 rounded border text-[11px] leading-relaxed bg-cyber-success/5 border-cyber-success/30 text-cyber-success">
                  {selectedNode.findings}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
