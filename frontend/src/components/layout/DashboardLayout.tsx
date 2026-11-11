import React from 'react'
import type { ConnectionStatus } from '../../services/simulationSocket'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DashboardLayoutProps {
  header: React.ReactNode
  connectionStatus?: ConnectionStatus
  onReconnect?: () => void
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  connectionStatus,
  onReconnect,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Application Header */}
      {header}

      {/* Main Operations Content Area */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-[1600px] w-full mx-auto space-y-4">
        {/* Offline Warning Banner */}
        {connectionStatus === 'DISCONNECTED' && (
          <div
            role="alert"
            className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-rose-300 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong className="text-rose-200">ENGINE OFFLINE:</strong> Simulation engine disconnected. Ensure backend server is running (<code className="bg-rose-900/40 px-1 py-0.5 rounded text-rose-200 text-[11px]">uvicorn main:app --port 8000</code>).
              </span>
            </div>
            {onReconnect && (
              <button
                onClick={onReconnect}
                aria-label="Reconnect to simulation engine"
                className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 active:bg-rose-950 text-rose-200 border border-rose-700/80 font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px] focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reconnect Engine
              </button>
            )}
          </div>
        )}

        {/* View Content */}
        {children}
      </main>

      {/* Command Center Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-3 px-5 text-center text-xs font-mono text-slate-500">
        Wildfire OS Simulator — Emergency Operations Console &amp; Virtual Priority Scheduler
      </footer>
    </div>
  )
}
