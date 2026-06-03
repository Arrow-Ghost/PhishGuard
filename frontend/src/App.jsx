import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ThreatMap from './components/ThreatMap';
import SupplyChain from './pages/SupplyChain';
import Sandbox from './pages/Sandbox';
import LogTable from './components/LogTable';
import { Shield, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    function connect() {
      // Connect to backend WebSockets server (port 5001)
      ws = new WebSocket('ws://localhost:5001');

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[PhishGuard UI] WebSocket interconnect channel linked.');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'SEEDED_LOGS') {
            setLogs(payload.data);
          } else if (payload.type === 'NEW_LOG') {
            setLogs(prev => [payload.data, ...prev]);
            
            // Trigger browser system audio beep or glowing overlay in premium consoles on critical exfiltrations
            if (payload.data.status === 'BLOCKED') {
              console.warn(`[SHIELD ALERT] Blocked malicious activity from ${payload.data.sourcePackage}: ${payload.data.details}`);
            }
          }
        } catch (err) {
          console.error('[PhishGuard UI] Error parsing telemetry payload:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.warn('[PhishGuard UI] Connection lost. Triggering reconnection sequence...');
        
        // Attempt reconnection after 5 seconds
        reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        // Suppress websocket reports, standard handler handles retry via onclose
        ws.close();
      };
    }

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // View Router Layout
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard logs={logs} />;
      case 'threatmap':
        return <ThreatMap />;
      case 'supplychain':
        return <SupplyChain />;
      case 'sandbox':
        return <Sandbox />;
      case 'logs':
        return <LogTable logs={logs} />;
      default:
        return <Dashboard logs={logs} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-cyber-bg text-slate-100 overflow-hidden font-sans">
      
      {/* Navigation panel */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isConnected={isConnected} 
      />

      {/* Operations display frame */}
      <main className="flex-1 flex flex-col min-w-0 h-screen bg-cyber-bg">
        
        {/* Top telemetry banner */}
        <header className="h-16 border-b border-cyber-border/40 px-8 flex justify-between items-center shrink-0 bg-cyber-panel/40 select-none">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400">System</span>
            <span className="text-xs font-mono text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-200 capitalize font-medium">{activeView}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-success"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-danger"></span>
                )}
              </span>
              <span className="text-slate-400 font-medium">
                {isConnected ? 'Telemetry Active' : 'Offline'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <div className="flex-1 p-8 overflow-hidden relative z-10">
          {renderActiveView()}
        </div>

      </main>
    </div>
  );
}
