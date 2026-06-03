import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Eye, 
  CheckCircle,
  XCircle,
  FileCode,
  Flame
} from 'lucide-react';

export default function ThreatMap() {
  // Mock dataset representing the client-side dependency supply chain graph
  const nodes = [
    {
      id: 'node-root',
      name: 'PhishGuard App Host',
      type: 'root',
      x: 350,
      y: 250,
      r: 35,
      version: '1.0.0',
      riskScore: 0,
      category: 'safe',
      license: 'MIT',
      author: 'Main Developer',
      description: 'The core client execution application compiling all security agents.',
      findings: 'Safe. Client DOM sandboxing hooks active.'
    },
    {
      id: 'node-react',
      name: 'react-dom',
      type: 'dependency',
      x: 200,
      y: 110,
      r: 25,
      version: '18.2.0',
      riskScore: 5,
      category: 'safe',
      license: 'MIT',
      author: 'Meta Open Source',
      description: 'Provides DOM-specific methods that can be used at the top level of your app.',
      findings: 'Safe. Directly references vetted react packages.'
    },
    {
      id: 'node-axios',
      name: 'axios',
      type: 'dependency',
      x: 140,
      y: 250,
      r: 25,
      version: '1.6.7',
      riskScore: 12,
      category: 'safe',
      license: 'MIT',
      author: 'Matt Zabriskie',
      description: 'Promise-based HTTP client for the browser and node.js.',
      findings: 'Safe. Interceptor hooks deployed over all communications.'
    },
    {
      id: 'node-lodash',
      name: 'lodash',
      type: 'dependency',
      x: 500,
      y: 110,
      r: 25,
      version: '4.17.20',
      riskScore: 45,
      category: 'warning',
      license: 'MIT',
      author: 'OpenJS Foundation',
      description: 'A modern JavaScript utility library delivering modularity & performance.',
      findings: 'Legacy vulnerability found (Prototype Pollution CVE-2020-8203). Update highly recommended.'
    },
    {
      id: 'node-miner',
      name: 'crypt-miner-helper',
      type: 'dependency',
      x: 560,
      y: 250,
      r: 28,
      version: '1.0.4',
      riskScore: 94,
      category: 'critical',
      license: 'Apache-2.0',
      author: 'anonymous-actor',
      description: 'Calculates dynamic canvas frames. Contains hidden secondary threads running CPU mining operations.',
      findings: 'CRITICAL THREAT: Typosquatting mimicry detected. Dynamic resource harvesting triggered during window idle.'
    },
    {
      id: 'node-logger',
      name: 'simple-logger',
      type: 'dependency',
      x: 200,
      y: 390,
      r: 25,
      version: '2.1.0',
      riskScore: 22,
      category: 'safe',
      license: 'ISC',
      author: 'Console Logger Ltd.',
      description: 'Lightweight logger writing clean stdout pipelines.',
      findings: 'Safe. Vetted security boundaries.'
    },
    {
      id: 'node-harvest',
      name: 'mal-helper-utils',
      type: 'dependency',
      x: 500,
      y: 390,
      r: 28,
      version: '0.9.1',
      riskScore: 88,
      category: 'critical',
      license: 'MIT',
      author: 'suspicious-dev-org',
      description: 'Utility classes assisting state mapping. Tries to dynamically read cookies and exfiltrate to external domains.',
      findings: 'CRITICAL THREAT: Interceptor blocked POST payload towards eval-server.cc. High exfiltration fingerprint.'
    }
  ];

  // Map links connecting the nodes together
  const links = [
    { source: 'node-root', target: 'node-react' },
    { source: 'node-root', target: 'node-axios' },
    { source: 'node-root', target: 'node-lodash' },
    { source: 'node-root', target: 'node-miner' },
    { source: 'node-root', target: 'node-logger' },
    { source: 'node-root', target: 'node-harvest' }
  ];

  const [selectedNode, setSelectedNode] = useState(nodes[0]);
  const [quarantined, setQuarantined] = useState([]);

  const getRiskColor = (score, type) => {
    if (type === 'root') return 'stroke-cyber-primary fill-cyber-primary/10';
    if (score >= 70) return 'stroke-cyber-danger fill-cyber-danger/10';
    if (score >= 40) return 'stroke-cyber-warning fill-cyber-warning/10';
    return 'stroke-cyber-success fill-cyber-success/10';
  };

  const getLinkColor = (targetNodeId) => {
    const target = nodes.find(n => n.id === targetNodeId);
    if (quarantined.includes(targetNodeId)) return 'stroke-slate-700 stroke-dasharray-[4]';
    if (target.riskScore >= 70) return 'stroke-cyber-danger/40';
    if (target.riskScore >= 40) return 'stroke-cyber-warning/40';
    return 'stroke-cyber-success/40';
  };

  const handleQuarantine = (id) => {
    if (quarantined.includes(id)) {
      setQuarantined(quarantined.filter(item => item !== id));
    } else {
      setQuarantined([...quarantined, id]);
    }
  };

  return (
    <div className="flex gap-6 h-full items-stretch">
      {/* Visual Workspace Canvas Panel */}
      <div className="flex-1 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col relative min-w-0">
        
        {/* Header telemetry details */}
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
                Interactive active supply-chain topology
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-success border border-cyber-success/30"></span> SECURE</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-warning border border-cyber-warning/30"></span> WARNING</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyber-danger border border-cyber-danger/30"></span> CRITICAL</span>
          </div>
        </div>

        {/* Dynamic SVG Visual Node canvas graph */}
        <div className="flex-1 bg-cyber-bg/40 rounded-lg border border-cyber-border/30 relative overflow-hidden flex items-center justify-center">
          
          <svg 
            viewBox="0 0 700 500" 
            className="w-full h-full max-w-[650px] relative z-10 select-none"
          >
            {/* Drawing SVG Link Paths */}
            {links.map((link, idx) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              const isQuarantined = quarantined.includes(link.target);
              return (
                <g key={idx}>
                  {/* Flat line vector path */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    className={`stroke-[1.5] transition-all duration-300 ${getLinkColor(link.target)}`}
                  />
                  {/* Streaming data-packets visual indicators */}
                  {!isQuarantined && (
                    <circle r="2" className={`fill-slate-400 ${
                      tgtNode.riskScore >= 70 ? 'fill-cyber-danger' : tgtNode.riskScore >= 40 ? 'fill-cyber-warning' : 'fill-cyber-primary'
                    }`}>
                      <animateMotion
                        path={`M ${srcNode.x} ${srcNode.y} L ${tgtNode.x} ${tgtNode.y}`}
                        dur={`${4 - (tgtNode.riskScore / 40)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Drawing Graph Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isRoot = node.type === 'root';
              const isNodeQuarantined = quarantined.includes(node.id);
              
              return (
                <g 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group animate-fadeIn"
                >
                  {/* Quarantined node overlay boundary */}
                  {isNodeQuarantined && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 6}
                      className="fill-none stroke-slate-600 stroke-[1] stroke-dasharray-[3]"
                    />
                  )}

                  {/* Selected node highlight indicator */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 4}
                      className={`fill-none stroke-[1.5] stroke-dasharray-[2] ${
                        isRoot ? 'stroke-cyber-primary' : node.riskScore >= 70 ? 'stroke-cyber-danger' : node.riskScore >= 40 ? 'stroke-cyber-warning' : 'stroke-cyber-success'
                      }`}
                    />
                  )}

                  {/* Primary Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    className={`stroke-[2] fill-[#161b26] transition-all duration-300 ${
                      isNodeQuarantined
                        ? 'stroke-slate-600 fill-slate-900/90'
                        : isRoot
                        ? 'stroke-cyber-primary'
                        : node.riskScore >= 70
                        ? 'stroke-cyber-danger'
                        : node.riskScore >= 40
                        ? 'stroke-cyber-warning'
                        : 'stroke-cyber-success'
                    }`}
                  />

                  {/* Inner Icon indicator or visual symbols */}
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    className={`font-sans text-[10px] font-bold select-none pointer-events-none fill-slate-300`}
                  >
                    {isRoot ? 'Core' : isNodeQuarantined ? '🔒' : node.riskScore >= 70 ? '🛑' : node.riskScore >= 40 ? '⚠️' : '✓'}
                  </text>

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + node.r + 14}
                    textAnchor="middle"
                    className={`font-sans text-[9px] font-semibold fill-slate-400 pointer-events-none select-none tracking-wide`}
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
          {selectedNode.riskScore >= 70 ? (
            <ShieldAlert className="w-5 h-5 text-cyber-danger animate-bounce" />
          ) : selectedNode.type === 'root' ? (
            <CheckCircle className="w-5 h-5 text-cyber-primary" />
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
          
          {/* Risk Level Gauge block */}
          {selectedNode.type !== 'root' && (
            <div>
              <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1.5">Calculated Risk Index</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-cyber-bg h-3 rounded-full overflow-hidden border border-cyber-border/30 p-[1px]">
                  <div 
                    style={{ width: `${selectedNode.riskScore}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedNode.riskScore >= 70 
                        ? 'bg-cyber-danger' 
                        : selectedNode.riskScore >= 40 
                        ? 'bg-cyber-warning' 
                        : 'bg-cyber-success'
                    }`}
                  />
                </div>
                <span className={`font-display font-black text-sm tracking-wide ${
                  selectedNode.riskScore >= 70 
                    ? 'text-cyber-danger glow-text-danger' 
                    : selectedNode.riskScore >= 40 
                    ? 'text-cyber-warning glow-text-warning' 
                    : 'text-cyber-success glow-text-success'
                }`}>
                  {selectedNode.riskScore}/100
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Node Domain</div>
            <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200">
              {selectedNode.type === 'root' ? 'Local Host Origin' : 'Third-Party Node Module'}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">License & Publisher</div>
            <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-300 flex justify-between">
              <span>{selectedNode.license}</span>
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
            <div className={`p-3 rounded border text-[11px] leading-relaxed ${
              selectedNode.riskScore >= 70 
                ? 'bg-cyber-danger/5 border-cyber-danger/30 text-cyber-danger' 
                : selectedNode.riskScore >= 40 
                ? 'bg-cyber-warning/5 border-cyber-warning/30 text-cyber-warning' 
                : 'bg-cyber-success/5 border-cyber-success/30 text-cyber-success'
            }`}>
              {selectedNode.findings}
            </div>
          </div>
        </div>

        {/* Quarantine Action triggers */}
        {selectedNode.type !== 'root' && (
          <div className="mt-4 pt-3 border-t border-cyber-border/30 shrink-0">
            <button
              onClick={() => handleQuarantine(selectedNode.id)}
              className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 border flex items-center justify-center gap-2 ${
                quarantined.includes(selectedNode.id)
                  ? 'bg-cyber-success/15 border-cyber-success text-cyber-success hover:bg-cyber-success/20'
                  : 'bg-cyber-danger/10 border-cyber-danger text-cyber-danger hover:bg-cyber-danger/20 shadow-glow-danger/10 hover:shadow-glow-danger/20'
              }`}
            >
              {quarantined.includes(selectedNode.id) ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Package Restored
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 animate-pulse" />
                  Quarantine Package
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
