import React from 'react'
import type { VirtualProcess } from '../../types/simulation'
import { Play, Activity, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react'

interface PCBTableProps {
  processes: VirtualProcess[]
  runningProcessPid?: number | null
}

export const PCBTable: React.FC<PCBTableProps> = ({ processes, runningProcessPid }) => {
  const getPriorityBadge = (priority: VirtualProcess['priority'], level: number) => {
    switch (priority) {
      case 'HIGHEST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            P{level} HIGHEST
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            P{level} HIGH
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            P{level} MEDIUM
          </span>
        )
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            P{level} LOW
          </span>
        )
    }
  }

  const getStateBadge = (state: VirtualProcess['state'], isRunning: boolean) => {
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <Play className="w-2.5 h-2.5 fill-current animate-pulse text-emerald-400" />
          RUNNING
        </span>
      )
    }

    switch (state) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Activity className="w-2.5 h-2.5 text-blue-400" />
            READY
          </span>
        )
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
            WAITING
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-2.5 h-2.5 text-slate-400" />
            COMPLETED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {state}
          </span>
        )
    }
  }

  // Sort processes by PID for consistent canonical PCB table order
  const sortedProcesses = [...processes].sort((a, b) => a.pid - b.pid)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Process Control Block (PCB) Registry
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          5 KERNEL PROCESSES REGISTERED
        </span>
      </div>

      {sortedProcesses.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs font-mono bg-slate-950 rounded-lg border border-slate-800">
          No active process descriptors registered in Kernel PCB.
        </div>
      ) : (
        <>
          {/* Desktop Tabular View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-950/60">
                  <th className="py-2.5 px-3 font-bold">PID</th>
                  <th className="py-2.5 px-3 font-bold">PROCESS NAME</th>
                  <th className="py-2.5 px-3 font-bold">PRIORITY</th>
                  <th className="py-2.5 px-3 font-bold">STATE</th>
                  <th className="py-2.5 px-3 font-bold">SIMULATED LOAD</th>
                  <th className="py-2.5 px-3 font-bold text-center">CYCLES</th>
                  <th className="py-2.5 px-3 font-bold">LAST RUN</th>
                  <th className="py-2.5 px-3 font-bold">WAITING REASON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedProcesses.map((proc) => {
                  const isRunning = proc.state === 'RUNNING' || proc.pid === runningProcessPid

                  return (
                    <tr
                      key={proc.pid}
                      className={`transition-colors ${
                        isRunning
                          ? 'bg-emerald-950/20 text-slate-100 font-semibold'
                          : 'hover:bg-slate-950/40 text-slate-300'
                      }`}
                    >
                      {/* PID */}
                      <td className="py-3 px-3 font-bold text-slate-400 text-[11px]">
                        #{proc.pid}
                      </td>

                      {/* Name & Subtitle description */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{proc.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {proc.description}
                        </div>
                      </td>

                      {/* Priority Tier & Rank */}
                      <td className="py-3 px-3">
                        {getPriorityBadge(proc.priority, proc.priorityLevel)}
                      </td>

                      {/* State */}
                      <td className="py-3 px-3">
                        {getStateBadge(proc.state, isRunning)}
                      </td>

                      {/* Simulated CPU Usage */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 w-8">
                            {proc.cpuUsage}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isRunning ? 'bg-emerald-400' : 'bg-slate-600'
                              }`}
                              style={{ width: `${proc.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Cycles / Execution Ticks */}
                      <td className="py-3 px-3 text-center font-bold text-slate-300">
                        {proc.executionCount ?? 0}
                      </td>

                      {/* Last Run Step */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {proc.lastRunAt !== null && proc.lastRunAt !== undefined
                          ? `T+${proc.lastRunAt}s`
                          : 'Never'}
                      </td>

                      {/* Waiting Reason */}
                      <td className="py-3 px-3 text-[11px]">
                        {proc.waitingReason ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-mono text-[10px]">
                            {proc.waitingReason}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (hidden on md and above) */}
          <div className="md:hidden flex flex-col gap-2.5 font-mono text-xs">
            {sortedProcesses.map((proc) => {
              const isRunning = proc.state === 'RUNNING' || proc.pid === runningProcessPid

              return (
                <div
                  key={proc.pid}
                  className={`p-3 rounded-lg border transition-all ${
                    isRunning
                      ? 'bg-slate-950 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Top: PID, Name, Priority, State */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 text-[11px]">#{proc.pid}</span>
                      <span className="font-bold text-slate-200">{proc.name}</span>
                    </div>
                    {getStateBadge(proc.state, isRunning)}
                  </div>

                  {/* Body Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 text-[10px] block">PRIORITY</span>
                      {getPriorityBadge(proc.priority, proc.priorityLevel)}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SIMULATED LOAD</span>
                      <span className="text-slate-300 font-bold">{proc.cpuUsage}% CPU</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">EXECUTION CYCLES</span>
                      <span className="text-slate-200 font-bold">{proc.executionCount ?? 0} ticks</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">LAST EXECUTION</span>
                      <span className="text-slate-300">
                        {proc.lastRunAt !== null && proc.lastRunAt !== undefined
                          ? `T+${proc.lastRunAt}s`
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  {/* Waiting Reason or Description */}
                  {proc.waitingReason ? (
                    <div className="mt-2 pt-1.5 border-t border-slate-850 flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-bold">WAITING REASON:</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                        {proc.waitingReason}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 pt-1.5 border-t border-slate-850 text-[10px] text-slate-500 truncate">
                      {proc.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

