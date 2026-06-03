import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Network, 
  PackageSearch, 
  Terminal, 
  Activity, 
  ServerCrash 
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isConnected }) {
  const menuItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Telemetry Stream', icon: Activity },
    { id: 'threatmap', label: 'Threat Vector Map', icon: Network },
    { id: 'supplychain', label: 'Supply Chain Scanner', icon: PackageSearch },
    { id: 'sandbox', label: 'Shield Sandbox', icon: Terminal },
  ];

  return (
    <aside className="w-72 bg-cyber-panel border-r border-cyber-border/40 p-6 flex flex-col h-screen shrink-0 relative">

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 select-none">
        <div className="p-2 bg-cyber-primary text-white rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg text-slate-100">
            Phish<span className="text-slate-100">Guard</span>
          </h1>
          <span className="text-[10px] font-mono text-slate-400 tracking-wider block">
            Zero-Trust Network Guard
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        <span className="text-[10px] font-mono font-semibold tracking-widest text-slate-500 uppercase px-3 block mb-2">
          Security Operations
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-cyber-primary/10 text-white font-medium border border-cyber-primary/25'
                  : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${
                isActive ? 'text-cyber-primary' : 'text-slate-400'
              }`} />
              <span className="text-sm font-sans tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-primary ml-auto"></span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
