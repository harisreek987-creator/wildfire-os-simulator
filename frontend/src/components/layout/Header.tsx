import React from 'react'
import { Flame, ShieldCheck, Clock, Cpu, Server, RefreshCw } from 'lucide-react'
import type { SimulationStats } from '../../types/simulation'
import type { ConnectionStatus } from '../../services/simulationSocket'

interface HeaderProps {
  stats: SimulationStats
  connectionStatus: ConnectionStatus
  onReconnect?: () => void
}

export const Header: React.FC<HeaderProps> = ({ stats, connectionStatus, onReconnect }) => {
  const formatTime = (timeVal: string | number) => {
    let seconds = 0
    if (typeof timeVal === 'number') {
      seconds = timeVal
    } else if (typeof timeVal === 'string') {
      const match = timeVal.match(/\d+/)
      seconds = match ? parseInt(match[0], 10) : 0
    }

    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isConnected = connectionStatus === 'CONNECTED'
  const isConnecting = connectionStatus === 'CONNECTING'

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 text-slate-100 flex flex-wrap items-center justify-between gap-4 shadow-lg sticky top-0 z-50">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 rounded-lg text-amber-500 flex items-center justify-center shadow-md shadow-amber-950/30">
          <Flame className="w-6 h-6 animate-pulse text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100 font-mono">
              Wildfire OS Simulator
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
              OS VIVA MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Command Operations &amp; Virtual Priority Scheduler
          </p>
        </div>
      </div>

      {/* System Status Badges */}
      <div className="flex items-center flex-wrap gap-2.5 font-mono text-xs">
        {/* Backend Engine WebSocket Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">ENGINE:</span>
          <span
            className={`flex items-center gap-1.5 font-bold ${
              isConnected
                ? 'text-emerald-400'
                : isConnecting
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 animate-ping'
                  : isConnecting
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            {connectionStatus}
          </span>
          {!isConnected && onReconnect && (
            <button
              onClick={onReconnect}
              title="Click to reconnect to simulation engine"
              aria-label="Reconnect to backend simulation engine"
              className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-950/80 hover:bg-rose-900 active:bg-rose-950 text-rose-300 border border-rose-800 rounded transition cursor-pointer flex items-center gap-1 font-sans focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>{isConnecting ? 'Connecting...' : 'Retry'}</span>
            </button>
          )}
        </div>

        {/* Simulation State */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">SIM:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
              stats.status === 'RUNNING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : stats.status === 'PAUSED'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {stats.status}
          </span>
        </div>

        {/* Simulation Time */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-400">TIME:</span>
          <span className="font-bold text-amber-400 tracking-wider">
            {formatTime(stats.elapsedTime)}
          </span>
        </div>

        {/* System Health */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px]">KERNEL ONLINE</span>
        </div>
      </div>
    </header>
  )
}
