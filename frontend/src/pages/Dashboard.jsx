import React from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Layers, 
  HelpCircle,
  Activity, 
  Lock, 
  ShieldAlert,
  Server
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
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

export default function Dashboard({ logs }) {
  // Compute metrics dynamically from the live logs
  const totalMonitored = 167; // Simulated system packages
  const blockedCount = logs.filter(l => l.status === 'BLOCKED').length;
  const warningsCount = logs.filter(l => l.severity === 'warning').length;
  const sysStatus = 'ACTIVE';

  // Sparkline arrays to feed MetricCards
  const depSparkline = [154, 158, 160, 160, 162, 165, 167, 167];
  const blockedSparkline = [2, 4, 3, 5, 8, 8, 10, blockedCount];
  const warningSparkline = [1, 2, 2, 4, 3, 3, 4, warningsCount];
  const statusSparkline = [100, 100, 100, 100, 100, 100, 100, 100];

  // Recharts timeline mock logs dataset
  const chartData = [
    { hour: '16:00', allowed: 48, blocked: 0, alerts: 1 },
    { hour: '17:00', allowed: 64, blocked: 1, alerts: 2 },
    { hour: '18:00', allowed: 52, blocked: 0, alerts: 0 },
    { hour: '19:00', allowed: 90, blocked: 2, alerts: 3 },
    { hour: '20:00', allowed: 74, blocked: 1, alerts: 1 },
    { hour: '21:00', allowed: 110, blocked: blockedCount, alerts: warningsCount },
  ];

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
          subtext="6 Vetted CDN roots"
          icon={Layers}
          color="primary"
          trend={{ type: 'up', value: '+4.5%' }}
          sparklineData={depSparkline}
        />
        <MetricCard
          title="Stopped Exfiltrations"
          value={blockedCount}
          subtext="Credentials harvesting blocked"
          icon={Flame}
          color="danger"
          trend={{ type: 'up', value: `+${blockedCount}` }}
          sparklineData={blockedSparkline}
        />
        <MetricCard
          title="Intrusion Alerts"
          value={warningsCount}
          subtext="Dynamic DOM code threats"
          icon={ShieldAlert}
          color="warning"
          trend={{ type: 'up', value: `+${warningsCount}` }}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Timeline Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col h-[320px]">
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

      {/* Operations Quick Feed logs */}
      <div className="glass-panel rounded-xl border border-cyber-border/40 p-5 flex flex-col">
        <h3 className="font-display font-bold text-sm tracking-wider text-slate-100 uppercase mb-4 border-b border-cyber-border/30 pb-2">
          Latest Intercept Alerts
        </h3>
        
        <div className="space-y-2.5 max-h-56 overflow-y-auto">
          {logs.slice(0, 4).map((log) => {
            const isBlocked = log.status === 'BLOCKED';
            const isWarning = log.severity === 'warning';
            return (
              <div 
                key={log.id} 
                className={`p-3 rounded-lg border font-mono text-xs flex justify-between items-center transition-all hover:bg-cyber-panel/40 ${
                  isBlocked 
                    ? 'bg-cyber-danger/[0.04] border-cyber-danger/30' 
                    : isWarning 
                    ? 'bg-cyber-warning/[0.04] border-cyber-warning/30' 
                    : 'bg-cyber-bg/60 border-cyber-border/20'
                }`}
              >
                <div className="flex gap-3 items-center min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-widest font-display select-none ${
                    isBlocked 
                      ? 'border-cyber-danger text-cyber-danger' 
                      : isWarning 
                      ? 'border-cyber-warning text-cyber-warning' 
                      : 'border-cyber-primary text-cyber-primary'
                  }`}>
                    {log.status}
                  </span>
                  <div className="truncate min-w-0">
                    <span className="text-slate-100 font-bold mr-2">[{log.sourcePackage}]</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                </div>
                <span className="text-[10px] text-cyber-muted shrink-0 select-none ml-4">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
