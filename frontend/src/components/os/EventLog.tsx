import React, { useState } from 'react'
import type { EventLogEntry } from '../../types/simulation'
import { Terminal, ShieldAlert, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react'

export type EventFilterType = 'ALL' | 'OS_SCHEDULER' | 'FIRE_INCIDENTS' | 'ALERTS_ONLY'

interface EventLogProps {
  logs: EventLogEntry[]
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const [activeFilter, setActiveFilter] = useState<EventFilterType>('ALL')

  const getSeverityBadge = (severity: EventLogEntry['severity']) => {
    switch (severity) {
      case 'alert':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      case 'info':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  const getSeverityIcon = (severity: EventLogEntry['severity']) => {
    switch (severity) {
      case 'alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      case 'warning':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
    }
  }

  // Filter categorization rules based on actual event types & sources
  const isOsSchedulerEvent = (event: EventLogEntry): boolean => {
    const osTypes = ['ALERT', 'EMERGENCY_RESPONSE', 'RESOURCE_ALLOCATION', 'SENSOR_SCAN']
    if (osTypes.includes(event.type)) return true
    const src = (event.source || '').toLowerCase()
    return src.includes('pid') || src.includes('os') || src.includes('kernel') || src.includes('resource')
  }

  const isFireIncidentEvent = (event: EventLogEntry): boolean => {
    const fireTypes = ['IGNITION', 'FIRE_SPREAD', 'SENSOR_DETECTION', 'FIRE_CONTAINED']
    return fireTypes.includes(event.type)
  }

  const isAlertEvent = (event: EventLogEntry): boolean => {
    return event.severity === 'alert' || event.type === 'ALERT' || event.type === 'SENSOR_DETECTION'
  }

  // Apply filter without mutating source list
  const filteredLogs = logs.filter((log) => {
    switch (activeFilter) {
      case 'OS_SCHEDULER':
        return isOsSchedulerEvent(log)
      case 'FIRE_INCIDENTS':
        return isFireIncidentEvent(log)
      case 'ALERTS_ONLY':
        return isAlertEvent(log)
      case 'ALL':
      default:
        return true
    }
  })

  // Filter button metadata with dynamic counts
  const filters: { key: EventFilterType; label: string; count: number }[] = [
    { key: 'ALL', label: 'ALL EVENTS', count: logs.length },
    { key: 'OS_SCHEDULER', label: 'OS & SCHEDULER', count: logs.filter(isOsSchedulerEvent).length },
    { key: 'FIRE_INCIDENTS', label: 'FIRE INCIDENTS', count: logs.filter(isFireIncidentEvent).length },
    { key: 'ALERTS_ONLY', label: 'ALERTS ONLY', count: logs.filter(isAlertEvent).length },
  ]

  return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
        {/* Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 text-xs font-mono gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-amber-500" />
                OS System Event Log &amp; IPC Dispatcher
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  BUFFER: {logs.length}/50 EVENTS
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-bold">
                  IPC STREAM LIVE
                </span>
              </div>
            </div>

                  {/* 4 Interactive Category Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 mr-1 flex items-center gap-1 hidden sm:flex">
                      <Filter className="w-3 h-3" />
                      FILTER:
                    </span>
                    {filters.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 border focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${activeFilter === f.key
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                          }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${activeFilter === f.key ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-900 text-slate-500'
                            }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Bounded Scrollable Log Feed */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 sm:p-3 max-h-[340px] overflow-y-auto space-y-2 font-mono text-xs shadow-inner">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-[11px]">
                        {logs.length === 0
                          ? 'No OS IPC events queued. Telemetry buffer listening...'
                          : `No events match the "${filters.find((f) => f.key === activeFilter)?.label}" filter.`}
                      </div>
                    ) : (
          filteredLogs.map((log, index) => {
            const isNewest = index === 0

                                return (
                                <div
                                  key={log.id}
                                  className={`flex items-start gap-2.5 p-2 rounded transition ${isNewest
                                      ? 'bg-slate-900/90 border border-amber-500/30 ring-1 ring-amber-500/20'
                                      : 'bg-slate-900/50 border border-slate-850 hover:bg-slate-900/80'
                                    }`}
                                >
                                  {/* Timestamp & Newest Pill */}
                                  <div className="flex flex-col items-start gap-1 shrink-0">
                                    <span className="text-[11px] text-slate-500 font-bold">
                                      [{log.timestamp}]
                                    </span>
                  {isNewest && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black tracking-wider">
                      NEWEST
                    </span>
                  )}
                </div>

                {/* Severity Icon */}
                                    <div className="shrink-0 mt-0.5">{getSeverityIcon(log.severity)}</div>

                                    {/* Event Details: Type, Source, Message */}
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span
                                          className={`px-1.5 py-0.2 text-[10px] font-bold rounded border uppercase ${getSeverityBadge(
                                            log.severity
                                          )}`}
                                        >
                                          {log.type}
                                        </span>
                                        {log.source && (
                                          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                                            {log.source}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-300 leading-relaxed break-words">
                                        {log.message}
                                      </p>
                                    </div>
                                  </div>
                                )
          })
        )}
                            </div>
                          </div>
                          )
}
