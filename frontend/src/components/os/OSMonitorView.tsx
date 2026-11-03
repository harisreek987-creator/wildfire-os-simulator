import React from 'react'
import type {
  VirtualProcess,
  ExecutionTickRecord,
  ResourceItem,
  EventLogEntry,
} from '../../types/simulation'
import { PCBTable } from './PCBTable'
import { SchedulerTimeline } from './SchedulerTimeline'
import { ResourceMutexPanel } from './ResourceMutexPanel'
import { EventLog } from './EventLog'
import {
  Cpu,
  Play,
  Activity,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Info,
  Clock,
  Layers,
} from 'lucide-react'

interface OSMonitorViewProps {
  processes: VirtualProcess[]
  runningProcessPid: number | null
  runningProcessName: string | null
  schedulerPolicy: string
  simulationTime: number
  isRunning: boolean
  executionHistory: ExecutionTickRecord[]
  resources: ResourceItem[]
  events: EventLogEntry[]
}

export const OSMonitorView: React.FC<OSMonitorViewProps> = ({
  processes,
  runningProcessPid,
  runningProcessName,
  schedulerPolicy,
  simulationTime,
  executionHistory,
  resources,
  events,
}) => {
  // 1. Process summary counts dynamically calculated from actual processes array
  const totalCount = processes.length
  const runningProcess =
    processes.find((p) => p.pid === runningProcessPid) ||
    processes.find((p) => p.state === 'RUNNING')

  const runningCount = runningProcess ? 1 : 0
  const readyCount = processes.filter(
    (p) => p.state === 'READY' && p.pid !== runningProcess?.pid
  ).length
  const waitingCount = processes.filter((p) => p.state === 'WAITING').length
  const completedCount = processes.filter((p) => p.state === 'COMPLETED').length

  // 2. Priority-based Ready Queue (Section 8)
  // Ordering: 1. Lower numeric priority level first, 2. Lower PID first
  const readyQueue = processes
    .filter((p) => p.state === 'READY' && p.pid !== runningProcess?.pid)
    .sort((a, b) => {
      if (a.priorityLevel !== b.priorityLevel) {
        return a.priorityLevel - b.priorityLevel
      }
      return a.pid - b.pid
    })

  // 3. Waiting / Blocked Queue (Section 9)
  const waitingQueue = processes.filter((p) => p.state === 'WAITING')

  // 4. Completed Processes (Section 9)
  const completedQueue = processes.filter((p) => p.state === 'COMPLETED')

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. OS Monitor Top Header & Telemetry Summary Counters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                  OS Process Scheduler &amp; PCB Telemetry
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {schedulerPolicy || 'PRIORITY'} PREEMPTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Virtual Operating System Kernel • Process Control Block Registry &amp; Queue Disciplines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>SIM CLOCK: T+{formatTime(simulationTime)}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Process Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          {/* Total */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>TOTAL PROCESSES</span>
              <Layers className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-200">{totalCount}</span>
              <span className="text-[10px] text-slate-500">Registered</span>
            </div>
          </div>

          {/* Running */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>RUNNING (CPU)</span>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-400">{runningCount}</span>
              <span className="text-[10px] text-slate-500">Active</span>
            </div>
          </div>

          {/* Ready */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>READY QUEUE</span>
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-blue-400">{readyCount}</span>
              <span className="text-[10px] text-slate-500">Queued</span>
            </div>
          </div>

          {/* Waiting */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>WAITING / BLOCKED</span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-amber-400">{waitingCount}</span>
              <span className="text-[10px] text-slate-500">Blocked</span>
            </div>
          </div>

          {/* Completed */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-col justify-between hidden sm:flex">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>COMPLETED</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-400">{completedCount}</span>
              <span className="text-[10px] text-slate-500">Exited</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Educational Preemption Banner */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs font-mono shadow-md">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <div className="font-bold text-slate-200">
            Educational OS Scheduling Model • Preemptive Priority Discipline
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            This module models virtual operating system process scheduling. When{' '}
            <strong className="text-rose-400 font-mono">Emergency Response (PID 104, P1 Highest)</strong> transitions
            to <span className="text-blue-400 font-mono font-bold">READY</span> following sensor fire detection, the
            scheduler preempts the running <strong className="text-orange-400 font-mono">Fire Spread Engine (PID 101, P2 High)</strong>.
            Ties between equal-priority processes are resolved deterministically by lower PID.
          </p>
        </div>
      </div>

      {/* 3. Full-Width PCB Table */}
      <PCBTable processes={processes} runningProcessPid={runningProcessPid} />

      {/* 4. 2-Column Scheduling Layout: Running Process (Hero) & Priority Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start font-mono">
        {/* Left Sub-Column: Current Running Process Hero */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Active Virtual CPU
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                DISPATCHED
              </span>
            </div>

            {runningProcess ? (
              <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-lg flex flex-col gap-3 shadow-inner ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold text-xs border border-slate-800">
                      PID #{runningProcess.pid}
                    </span>
                    <span className="font-bold text-slate-100 text-sm">
                      {runningProcess.name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Play className="w-2.5 h-2.5 fill-current animate-pulse text-emerald-400" />
                    RUNNING
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">
                  {runningProcess.description}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 block">PRIORITY TIER</span>
                    <span className="font-bold text-rose-400">
                      P{runningProcess.priorityLevel} {runningProcess.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">EXECUTION CYCLES</span>
                    <span className="font-bold text-slate-200">
                      {runningProcess.executionCount ?? 0} ticks
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">LAST SCHEDULED</span>
                    <span className="text-slate-300">
                      {runningProcess.lastRunAt !== null && runningProcess.lastRunAt !== undefined
                        ? `Step T+${runningProcess.lastRunAt}s`
                        : 'Initial'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SIMULATED CPU LOAD</span>
                    <span className="font-bold text-emerald-400">
                      {runningProcess.cpuUsage}% CPU
                    </span>
                  </div>
                </div>

                {/* Simulated Load Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>VIRTUAL CORE UTILIZATION</span>
                    <span>{runningProcess.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${runningProcess.cpuUsage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-2">
                <Cpu className="w-8 h-8 text-slate-700 mx-auto" />
                <div className="text-xs font-bold text-slate-400">CPU IDLE</div>
                <p className="text-[11px] text-slate-500 font-sans max-w-xs mx-auto">
                  No process is currently occupying the virtual CPU. Ready queue is awaiting simulation start.
                </p>
                {runningProcessName && (
                  <div className="text-[10px] text-slate-500">Last Context: {runningProcessName}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sub-Column: Priority Ready Queue & Waiting Queue */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Priority-Based Ready Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-blue-400" />
                Priority-Ordered Ready Queue ({readyQueue.length})
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                DISCIPLINE: RANK ASC, PID ASC
              </span>
            </div>

            {readyQueue.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                Ready queue is empty (all processes active or waiting).
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {readyQueue.map((proc, index) => (
                  <div
                    key={proc.pid}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 font-bold flex items-center justify-center text-[10px]">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{proc.name}</span>
                          <span className="text-[10px] text-slate-500">PID #{proc.pid}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-none">
                          {proc.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${proc.priorityLevel === 1
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : proc.priorityLevel === 2
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                      >
                        P{proc.priorityLevel} {proc.priority}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Waiting / Blocked Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Waiting / Blocked Queue ({waitingQueue.length})
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                BLOCKED ON IPC / SENSORS
              </span>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                No processes currently blocked or waiting.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {waitingQueue.map((proc) => (
                  <div
                    key={proc.pid}
                    className="p-2.5 bg-slate-950 border border-amber-950/40 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-bold border border-slate-800">
                        #{proc.pid}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">{proc.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-none">
                          {proc.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {proc.waitingReason ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                          WAIT: {proc.waitingReason}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                          WAITING ON INCIDENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Processes */}
            {completedQueue.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase">
                  Completed / Terminated Tasks:
                </div>
                <div className="space-y-1.5">
                  {completedQueue.map((proc) => (
                    <div
                      key={proc.pid}
                      className="p-2 bg-slate-950 border border-slate-850 rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-300">{proc.name}</span>
                        <span className="text-[10px] text-slate-500">#{proc.pid}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        COMPLETED (ALL FIRES CONTAINED)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Rolling 40-Tick Gantt Execution Timeline */}
      <SchedulerTimeline
        history={executionHistory}
        currentPid={runningProcessPid}
        currentTick={simulationTime}
      />

      {/* 6. Virtual OS Shared Resource Mutex Allocator */}
      <ResourceMutexPanel
        resources={resources}
        processes={processes}
      />

      {/* 7. System Event Log & IPC Dispatcher (Bottom) */}
      <EventLog logs={events} />
    </div>
  )
}
