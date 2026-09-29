import React from 'react'
import type { EventLogEntry } from '../../types/simulation'
import { Terminal, ShieldAlert, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface EventLogProps {
  logs: EventLogEntry[]
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const getSeverityBadge = (severity: EventLogEntry['severity']) => {
    switch (severity) {
      case 'alert':
        return 'bg-red-500/20 text-red-400 border-red-500/40'
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'success':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'info':
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const getSeverityIcon = (severity: EventLogEntry['severity']) => {
    switch (severity) {
      case 'alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400" />
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-amber-500" />
          OS System Event Log &amp; Dispatcher
        </div>
        <span className="text-[10px] text-slate-500 font-mono">IPC STREAM LIVE</span>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2 font-mono text-xs shadow-inner">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-[11px]">
            No OS IPC events queued. Telemetry buffer listening...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-850 hover:bg-slate-900 transition"
            >
              {/* Timestamp */}
              <span className="text-[11px] text-slate-500 shrink-0 font-bold">
                [{log.timestamp}]
              </span>

              {/* Severity Icon */}
              <div className="shrink-0 mt-0.5">{getSeverityIcon(log.severity)}</div>

              {/* Event Type & Message */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded border uppercase ${getSeverityBadge(
                      log.severity
                    )}`}
                  >
                    {log.type}
                  </span>
                  {log.source && (
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                      {log.source}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">{log.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
