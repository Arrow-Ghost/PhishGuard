import React, { useState } from 'react';
import { 
  Search, 
  Terminal, 
  FileText, 
  ChevronRight,
  FilterX
} from 'lucide-react';

export default function LogTable({ logs = [] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter logs based on search string and status selection
  const filteredLogs = logs.filter(log => {
    const caller = log.callerContext || log.sourcePackage || '';
    const action = log.action || '';
    const target = log.target || log.details || '';
    
    const matchesSearch = 
      caller.toLowerCase().includes(search.toLowerCase()) ||
      action.toLowerCase().includes(search.toLowerCase()) ||
      target.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'ALL' || 
      log.status === statusFilter ||
      (statusFilter === 'WARNINGS' && log.status === 'WARNING') ||
      (statusFilter === 'CRITICAL' && log.status === 'BLOCKED');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'BLOCKED':
        return 'text-rose-500 font-bold bg-rose-500/10 border-rose-500/20';
      case 'WARNING':
        return 'text-amber-500 font-medium bg-amber-500/10 border-amber-500/20';
      case 'ALLOWED':
      default:
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="flex gap-6 h-full items-stretch w-full">
      {/* Main Table Segment */}
      <div className="flex-1 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col min-w-0">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyber-primary/10 rounded-lg text-cyber-primary">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-100">
                Telemetry Log Stream
              </h2>
              <p className="text-[11px] text-slate-400">
                Real-time interceptor logs capturing browser-scope network and storage actions
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search context or actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm font-sans bg-cyber-bg/80 border border-cyber-border/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyber-primary transition-colors"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex border border-cyber-border/45 rounded-lg p-0.5 bg-cyber-bg/50">
              {['ALL', 'BLOCKED', 'WARNING'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                    statusFilter === filter
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Event Table container */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-cyber-border/30 bg-cyber-bg/30 max-h-[450px]">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-cyber-muted p-6">
              <FilterX className="w-12 h-12 text-cyber-muted/40 mb-3 animate-pulse" />
              <span className="font-mono text-sm uppercase font-semibold">No telemetries logged matching filters</span>
              <span className="text-[10px] font-mono text-cyber-muted/70 mt-1">Interceptors are awaiting client actions</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-cyber-border/40 bg-cyber-panel/60 sticky top-0 z-10">
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Timestamp</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Threat Vector / Type</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Source Origin</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Target Destination</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Status</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase">Latency</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-cyber-muted tracking-wider uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/20 font-mono text-xs">
                {filteredLogs.map((log, idx) => {
                  const isBlocked = log.status === 'BLOCKED';
                  const callerContextValue = log.callerContext || log.sourcePackage || 'unknown';
                  const targetValue = log.target || log.details || 'unknown';
                  const latencyValue = log.latencyMs != null ? `${log.latencyMs}ms` : '0ms';

                  return (
                    <tr 
                      key={log.id || idx} 
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-cyber-panel/30 cursor-pointer transition-colors ${
                        isBlocked ? 'bg-cyber-danger/[0.02]' : ''
                      } ${selectedLog?.id === log.id ? 'bg-cyber-primary/[0.04] border-l-2 border-l-cyber-primary' : ''}`}
                    >
                      {/* Timestamp Column */}
                      <td className="p-4 text-cyber-muted select-none">
                        {log.timestamp ? log.timestamp.replace(/ (AM|PM)/i, '') : new Date().toLocaleTimeString()}
                      </td>

                      {/* Threat Vector / Type Column */}
                      <td className="p-4 text-slate-200 font-semibold">
                        {log.action}
                      </td>

                      {/* Source Origin Column - Monospaced highlight container */}
                      <td className="p-4">
                        <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block max-w-[180px] truncate" title={callerContextValue}>
                          {callerContextValue}
                        </span>
                      </td>

                      {/* Target Destination Column */}
                      <td className="p-4 text-slate-300 max-w-[200px] truncate" title={targetValue}>
                        {targetValue}
                      </td>

                      {/* Status Column - Conditional semantic styling */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${getStatusBadgeStyle(log.status)}`}>
                          {log.status}
                        </span>
                      </td>

                      {/* Latency Column */}
                      <td className="p-4 text-slate-300 font-mono">
                        {latencyValue}
                      </td>

                      {/* Details indicator */}
                      <td className="p-4 text-right">
                        <ChevronRight className="w-4 h-4 text-cyber-muted/50 inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Side Stack-Trace Inspector Panel */}
      {selectedLog && (
        <div className="w-96 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col shrink-0 animate-fadeIn">
          <div className="flex justify-between items-start mb-4 border-b border-cyber-border/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-primary" />
                <h3 className="font-display font-bold text-sm tracking-wider text-slate-100 uppercase">
                  Event Analysis
                </h3>
              </div>
              <span className="text-[9px] font-mono text-cyber-muted uppercase block mt-0.5">
                ID: {selectedLog.id || 'N/A'}
              </span>
            </div>
            <button 
              onClick={() => setSelectedLog(null)}
              className="text-[10px] font-mono border border-cyber-border/40 hover:border-cyber-primary/60 px-2 py-1 rounded text-cyber-muted hover:text-cyber-primary transition-all uppercase"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs">
            {/* Context details */}
            <div>
              <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Origin Context</div>
              <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200 font-bold select-all break-all">
                {selectedLog.callerContext || selectedLog.sourcePackage || 'unknown'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Target Host / Resource</div>
              <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-slate-200 select-all break-all leading-relaxed">
                {selectedLog.target || selectedLog.details || 'unknown'}
              </div>
            </div>

            {/* Execution Latency Info */}
            <div>
              <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Intercept Execution Overhead</div>
              <div className="p-2.5 bg-cyber-bg border border-cyber-border/30 rounded text-cyan-300 font-bold">
                {selectedLog.latencyMs != null ? `${selectedLog.latencyMs}ms` : '0ms'}
              </div>
            </div>

            {/* Stack trace CLI terminal box */}
            <div>
              <div className="text-[10px] text-cyber-muted uppercase tracking-widest mb-1">Execution Call-Stack</div>
              <pre className="cli-terminal p-3 rounded text-[10px] leading-relaxed overflow-x-auto max-h-56 text-cyan-300/90 whitespace-pre">
                {selectedLog.stack || 'No Stack trace available.'}
              </pre>
            </div>

            {/* Mitigation recommendation */}
            <div className={`p-3 rounded-lg border ${
              selectedLog.status === 'BLOCKED' 
                ? 'bg-cyber-danger/5 border-cyber-danger/20 text-cyber-danger' 
                : 'bg-cyber-primary/5 border-cyber-primary/20 text-cyber-primary'
            }`}>
              <div className="font-bold uppercase tracking-wider text-[10px] mb-1">Shield Mitigations</div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {selectedLog.status === 'BLOCKED' 
                  ? 'Zero-Trust network interception blocked payload transfer. Malicious code was stopped in browser sandboxing scope. Check this script for exfiltration loops.' 
                  : 'Access permitted. Telemetry log recorded for supply chain audit logs. No standard policy violations detected.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
