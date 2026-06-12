import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Layers, 
  Activity, 
  Lock, 
  ShieldAlert,
  Server
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LogTable from '../components/LogTable';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Dashboard() {
  // Dynamic React state tracking variables
  const [logs, setLogs] = useState([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [allowedCount, setAllowedCount] = useState(0);

  // Active Real-Time Stream Synchronization
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('[Dashboard WS] Interconnect channel established.');
    };

    socket.onmessage = (event) => {
      try {
        const newLog = JSON.parse(event.data);
        
        // Prepend new event packet to logs
        setLogs((prev) => [newLog, ...prev]);
        
        // Ensure strict case matching with agent's string data payloads
        if (newLog.status === 'BLOCKED') {
          setBlockedCount((prev) => prev + 1);
        } else if (newLog.status === 'WARNING') {
          setWarningCount((prev) => prev + 1); // Feeds Intrusion/Warning UI indicators
        } else if (newLog.status === 'ALLOWED') {
          setAllowedCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error('[Dashboard WS] Error parsing telemetry package:', err);
      }
    };

    socket.onclose = () => {
      console.warn('[Dashboard WS] Disconnected.');
    };

    socket.onerror = (err) => {
      console.error('[Dashboard WS] Error detected:', err);
    };

    // System Lifecycle Cleanup - prevents open ghost connection loops on port 5001
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, []);

  // Compute metrics dynamically from baseline + live counters
  const totalMonitored = 167 + allowedCount;
  const sysStatus = 'ACTIVE';

  // Dynamic sparklines matching logs trends
  const depSparkline = Array.from({ length: 8 }, (_, i) => 160 + i + allowedCount);
  const blockedSparkline = Array.from({ length: 8 }, (_, i) => {
    const count = logs.slice(0, Math.ceil((i + 1) * (logs.length / 8))).filter(l => l.status === 'BLOCKED').length;
    return count;
  });
  const warningSparkline = Array.from({ length: 8 }, (_, i) => {
    const count = logs.slice(0, Math.ceil((i + 1) * (logs.length / 8))).filter(l => l.status === 'WARNING').length;
    return count;
  });
  const statusSparkline = Array.from({ length: 8 }, () => 100);

  // Group and format chart data dynamically from live logs
  const getChartData = () => {
    const timeGroups = {};
    
    // Read oldest logs first for chronological ordering
    [...logs].reverse().forEach((log) => {
      let timeLabel = log.timestamp || new Date().toLocaleTimeString();
      // Simplify the display timestamp format to HH:MM:SS
      timeLabel = timeLabel.replace(/ (AM|PM)/i, '');

      if (!timeGroups[timeLabel]) {
        timeGroups[timeLabel] = { hour: timeLabel, allowed: 0, blocked: 0, alerts: 0 };
      }

      if (log.status === 'BLOCKED') {
        timeGroups[timeLabel].blocked += 1;
      } else if (log.status === 'WARNING') {
        timeGroups[timeLabel].alerts += 1;
      } else {
        timeGroups[timeLabel].allowed += 1;
      }
    });

    const dataList = Object.values(timeGroups);
    return dataList.slice(-6); // Display up to 6 historical data intervals
  };

  const chartData = getChartData();
  if (chartData.length === 0) {
    chartData.push({ hour: '--:--', allowed: 0, blocked: 0, alerts: 0 });
  }

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] pr-2 select-none">
      
      {/* Dynamic Ops Welcome header */}
      <div className="flex justify-between items-center border-b border-cyber-border/20 pb-4">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-100">
            Security Dashboard
          </h2>
          <span className="text-xs text-slate-400 block mt-0.5">
            Real-time client telemetry monitoring and active browser safeguards.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs px-2.5 py-1 rounded-md border border-cyber-border/30 bg-cyber-panel/60">
          <Server className="w-3.5 h-3.5 text-cyber-primary" />
          <span className="text-slate-400">Status:</span>
          <span className="text-cyber-primary font-bold">Live</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Monitored Packages"
          value={totalMonitored}
          subtext="Vetted CDN roots"
          icon={Layers}
          color="primary"
          trend={{ type: 'up', value: `+${allowedCount}` }}
          sparklineData={depSparkline}
        />
        <MetricCard
          title="Interceptions"
          value={blockedCount}
          subtext="Malicious exfiltrations blocked"
          icon={Flame}
          color="danger"
          trend={{ type: 'up', value: `+${blockedCount}` }}
          sparklineData={blockedSparkline}
        />
        <MetricCard
          title="Intrusion Alerts"
          value={warningCount}
          subtext="Suspicious activity warnings"
          icon={ShieldAlert}
          color="warning"
          trend={{ type: 'up', value: `+${warningCount}` }}
          sparklineData={warningSparkline}
        />
        <MetricCard
          title="Intrusion Shield"
          value={sysStatus}
          subtext="Zero-Trust Engine Running"
          icon={ShieldCheck}
          color="success"
          sparklineData={statusSparkline}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Timeline Area Chart */}
        <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-[320px]">
          <div className="flex items-center gap-2.5 mb-4 shrink-0">
            <Activity className="w-5 h-5 text-cyber-primary" />
            <div>
              <h3 className="font-sans font-bold text-sm tracking-wide text-slate-100">
                Network & Intercept Activity
              </h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Real-time connection volume and blocked threat trends
              </span>
            </div>
          </div>
          
          <div className="flex-1 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#161b26', 
                    borderColor: '#242b3d', 
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    fontFamily: 'monospace'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area name="Normal Operations" type="monotone" dataKey="allowed" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAllowed)" />
                <Area name="Blocked Exfiltrations" type="monotone" dataKey="blocked" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Threat Ratio Bar Chart */}
        <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-[320px]">
          <div className="flex items-center gap-2.5 mb-4 shrink-0">
            <Lock className="w-5 h-5 text-cyber-danger" />
            <div>
              <h3 className="font-sans font-bold text-sm tracking-wide text-slate-100">
                Threat Breakdown
              </h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Aggregated active intrusion incidents by severity
              </span>
            </div>
          </div>

          <div className="flex-1 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#242b3d" strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#161b26', 
                    borderColor: '#242b3d', 
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    fontFamily: 'monospace'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar name="Anomalies / Warnings" dataKey="alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar name="Mitigations" dataKey="blocked" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operations Logs Feed */}
      <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col">
        <h3 className="font-display font-bold text-sm tracking-wider text-slate-100 uppercase mb-4 border-b border-cyber-border/30 pb-2">
          Latest Intercept Alerts
        </h3>
        <div className="w-full">
          <LogTable logs={logs} />
        </div>
      </div>
    </div>
  );
}
