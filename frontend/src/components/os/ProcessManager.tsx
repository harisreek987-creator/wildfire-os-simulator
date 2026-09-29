import React from 'react'
import type { VirtualProcess } from '../../types/simulation'
import { Cpu, ShieldAlert, Activity, RefreshCw, CheckCircle2, Play } from 'lucide-react'

interface ProcessManagerProps {
  processes: VirtualProcess[]
  runningProcessPid?: number | null
  runningProcessName?: string | null
  schedulerPolicy?: string
}

export const ProcessManager: React.FC<ProcessManagerProps> = ({
  processes,
  runningProcessPid,
  runningProcessName,
  schedulerPolicy = 'PRIORITY',
}) => {
  const getPriorityBadge = (priority: VirtualProcess['priority']) => {
    switch (priority) {
      case 'HIGHEST':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-black'
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700'
    }
  }

  const getStateIcon = (state: VirtualProcess['state']) => {
    switch (state) {
      case 'RUNNING':
        return <Play className="w-3 h-3 text-emerald-400 animate-pulse" />
      case 'WAITING':
        return <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
      case 'READY':
        return <Activity className="w-3 h-3 text-blue-400" />
      case 'COMPLETED':
        return <CheckCircle2 className="w-3 h-3 text-slate-400" />
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Virtual OS Priority Scheduler (PCB)
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            POLICY: <span className="text-emerald-400 font-bold">{schedulerPolicy}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            CURRENT: <span className="text-emerald-300 font-bold">{runningProcessName || (runningProcessPid ? `PID ${runningProcessPid}` : 'IDLE')}</span>
          </span>
        </div>
      </div>

      {/* Process Table List */}
      <div className="space-y-2 font-mono text-xs">
        {processes.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-[11px] bg-slate-950 rounded-lg border border-slate-800">
            Connecting to Virtual OS Kernel scheduler...
          </div>
        ) : (
          processes.map((proc) => {
            const isRunning = proc.state === 'RUNNING' || proc.pid === runningProcessPid

          return (
            <div
              key={proc.pid}
              className={`p-3 rounded-lg border transition-all duration-200 flex flex-col gap-2 ${
                isRunning
                  ? 'bg-slate-950 border-emerald-500/40 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Process Name & PID */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-400 text-[11px]">PID {proc.pid}</span>
                  <span className="font-semibold text-slate-200">{proc.name}</span>
                  {proc.priority === 'HIGHEST' && (
                    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800/40">
                      <ShieldAlert className="w-3 h-3" />
                      PREEMPTIVE
                    </span>
                  )}
                  {proc.waitingReason && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                      WAIT: {proc.waitingReason}
                    </span>
                  )}
                </div>

                {/* State & Priority Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold flex items-center gap-1 ${getPriorityBadge(
                      proc.priority
                    )}`}
                  >
                    P{proc.priorityLevel} {proc.priority}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                      isRunning
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {getStateIcon(proc.state)}
                    {proc.state}
                  </span>
                </div>
              </div>

              {/* CPU Usage Bar & Execution Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900/80">
                <span className="text-slate-500 text-[10px] truncate max-w-full sm:max-w-[240px]">
                  {proc.description}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">
                    TICKS: <span className="text-slate-300 font-bold">{proc.executionCount ?? 0}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      CPU {proc.cpuUsage}%
                    </span>
                    <div className="w-14 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isRunning ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${proc.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
      </div>
    </div>
  )
}
