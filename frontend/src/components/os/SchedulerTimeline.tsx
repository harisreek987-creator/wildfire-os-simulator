import React from 'react'
import type { ExecutionTickRecord } from '../../types/simulation'
import { Clock, Cpu } from 'lucide-react'

interface SchedulerTimelineProps {
  history: ExecutionTickRecord[]
  currentPid?: number | null
  currentTick?: number
}

export const SchedulerTimeline: React.FC<SchedulerTimelineProps> = ({
  history,
  currentPid,
  currentTick,
}) => {
  // Color configuration mapping per PID as specified in requirements
  const getPidColor = (pid: number | null) => {
    switch (pid) {
      case 104:
        // PID 104: Emergency Response (red/rose)
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/60',
          text: 'text-rose-300',
          bar: 'bg-rose-500',
          badge: 'bg-rose-950/60 text-rose-300 border-rose-800/80',
        }
      case 101:
        // PID 101: Fire Spread Engine (restrained orange)
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/60',
          text: 'text-orange-300',
          bar: 'bg-orange-500',
          badge: 'bg-orange-950/60 text-orange-300 border-orange-800/80',
        }
      case 102:
        // PID 102: Sensor Monitor (cyan/blue)
        return {
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/60',
          text: 'text-cyan-300',
          bar: 'bg-cyan-400',
          badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80',
        }
      case 103:
        // PID 103: Event Handler (teal)
        return {
          bg: 'bg-teal-500/20',
          border: 'border-teal-500/60',
          text: 'text-teal-300',
          bar: 'bg-teal-400',
          badge: 'bg-teal-950/60 text-teal-300 border-teal-800/80',
        }
      case 105:
        // PID 105: Statistics Collector (muted violet/slate)
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/60',
          text: 'text-purple-300',
          bar: 'bg-purple-400',
          badge: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
        }
      default:
        // Idle CPU
        return {
          bg: 'bg-slate-950',
          border: 'border-slate-800',
          text: 'text-slate-500',
          bar: 'bg-slate-700',
          badge: 'bg-slate-950 text-slate-500 border-slate-800',
        }
    }
  }

  const legendItems = [
    { pid: 104, name: 'Emergency Response', rank: 'P1' },
    { pid: 101, name: 'Fire Spread Engine', rank: 'P2' },
    { pid: 102, name: 'Sensor Monitor', rank: 'P3' },
    { pid: 103, name: 'Event Handler', rank: 'P3' },
    { pid: 105, name: 'Statistics Collector', rank: 'P4' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-emerald-400" />
          Virtual CPU Gantt Execution Timeline (Rolling 40 Ticks)
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            BUFFER: {history.length}/40 TICKS
          </span>
          {currentTick !== undefined && currentTick > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 font-bold">
              CURRENT: T+{currentTick}s
            </span>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-8 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-2 font-mono text-xs">
          <Cpu className="w-8 h-8 text-slate-700 mx-auto" />
          <div className="text-slate-400 font-bold">Awaiting Simulation Execution History</div>
          <p className="text-[11px] text-slate-500 font-sans max-w-sm mx-auto">
            Click &quot;Start Sim&quot; or &quot;Step (1s)&quot; in Overview to begin logging distinct scheduler context switches.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Scrollable Gantt Blocks Ribbon */}
          <div className="w-full overflow-x-auto pb-2 pt-1">
            <div className="min-w-[620px] flex flex-col gap-1.5 font-mono">
              {/* Tick Blocks Track */}
              <div className="flex items-center gap-1">
                {history.map((record, index) => {
                  const colors = getPidColor(record.pid)
                  const isLatest = index === history.length - 1

                  return (
                    <div
                      key={`tick-${record.tick}`}
                      className={`flex-1 min-w-[28px] max-w-[36px] h-14 rounded-md border p-1 flex flex-col justify-between items-center transition-all ${
                        colors.bg
                      } ${colors.border} ${
                        isLatest ? 'ring-2 ring-emerald-400 shadow-md shadow-emerald-950/40' : ''
                      }`}
                      title={`Tick T+${record.tick}s: ${record.processName} (${
                        record.pid ? `PID #${record.pid}` : 'Idle'
                      })`}
                    >
                      {/* Top: PID Tag */}
                      <span className={`text-[9px] font-bold truncate max-w-full ${colors.text}`}>
                        {record.pid ? `#${record.pid}` : 'IDLE'}
                      </span>

                      {/* Center: Accent Indicator */}
                      <div className={`w-full h-1.5 rounded-full ${colors.bar}`} />

                      {/* Bottom: Tick Number */}
                      <span className="text-[8px] text-slate-400">
                        {record.tick}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Time Ruler Labels */}
              <div className="flex items-center gap-1 text-[8px] text-slate-500 text-center">
                {history.map((record, idx) => (
                  <div
                    key={`ruler-${record.tick}`}
                    className="flex-1 min-w-[28px] max-w-[36px] truncate"
                  >
                    {idx === 0 || idx === history.length - 1 || record.tick % 5 === 0
                      ? `T+${record.tick}`
                      : '·'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Execution State Callout */}
          {history.length > 0 && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">LATEST DISPATCH:</span>
                <span className="font-bold text-slate-200">
                  T+{history[history.length - 1].tick}s
                </span>
                <span className="text-slate-600">→</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                    getPidColor(history[history.length - 1].pid).badge
                  }`}
                >
                  {history[history.length - 1].processName}{' '}
                  {history[history.length - 1].pid ? `(PID #${history[history.length - 1].pid})` : ''}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Context switch recorded deterministically per simulation step
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gantt Legend */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-mono">
        {legendItems.map((item) => {
          const colors = getPidColor(item.pid)
          const isCurrentlyRunning = currentPid === item.pid

          return (
            <div
              key={item.pid}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
                isCurrentlyRunning
                  ? 'bg-slate-950 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm ${colors.bar}`} />
              <span className="font-bold text-slate-300">#{item.pid}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {item.name}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">{item.rank}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
          <span>Idle / Transition</span>
        </div>
      </div>
    </div>
  )
}

