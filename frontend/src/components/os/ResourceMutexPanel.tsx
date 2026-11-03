import React from 'react'
import type { ResourceItem, VirtualProcess } from '../../types/simulation'
import { Lock, Unlock, Users, Droplets, Radio, ShieldAlert } from 'lucide-react'

interface ResourceMutexPanelProps {
  resources: ResourceItem[]
  processes: VirtualProcess[]
}

export const ResourceMutexPanel: React.FC<ResourceMutexPanelProps> = ({ resources, processes }) => {
  // Check if Emergency Response (PID 104) is waiting on resources
  const emergencyProc = processes.find((p) => p.pid === 104)
  const isWaitingOnResources = emergencyProc?.waitingReason === 'WAITING_FOR_RESOURCES'

  const getResourceIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('firefighter')) {
      return <Users className="w-4 h-4 text-orange-400" />
    }
    if (lower.includes('water')) {
      return <Droplets className="w-4 h-4 text-cyan-400" />
    }
    if (lower.includes('drone')) {
      return <Radio className="w-4 h-4 text-amber-400" />
    }
    return <Lock className="w-4 h-4 text-slate-400" />
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Lock className="w-4 h-4 text-amber-400" />
          Virtual OS Shared Resource Mutex Allocator
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          {isWaitingOnResources ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/80 font-bold">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              MUTEX CONTENTION: PID 104 BLOCKED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 font-bold">
              SYNCHRONIZATION: MUTEX LOCKS NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* Resource Mutex Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        {resources.map((res) => {
          const isLocked = res.inUse > 0
          const allocationPercent = Math.round((res.inUse / (res.total || 1)) * 100)

          return (
            <div
              key={res.id}
              className={`p-3 bg-slate-950 border rounded-lg flex flex-col gap-2.5 shadow-sm transition ${
                isLocked
                  ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header: Icon, Name, Mutex Status Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getResourceIcon(res.name)}
                  <span className="font-bold text-slate-200">{res.name}</span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    isLocked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-2.5 h-2.5" />
                      LOCKED (PID 104)
                    </>
                  ) : (
                    <>
                      <Unlock className="w-2.5 h-2.5" />
                      MUTEX FREE
                    </>
                  )}
                </span>
              </div>

              {/* Quantities Breakdown */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                <span className="text-emerald-400 font-semibold">
                  AVAILABLE: {res.available} {res.unit}
                </span>
                <span className="text-amber-400 font-semibold">
                  ALLOCATED: {res.inUse} {res.unit}
                </span>
              </div>

              {/* Allocation Capacity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>CAPACITY (TOTAL {res.total})</span>
                  <span>{allocationPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      allocationPercent > 70
                        ? 'bg-rose-500'
                        : allocationPercent > 0
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${allocationPercent}%` }}
                  />
                </div>
              </div>

              {/* Mutex Ownership Note */}
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900/60 truncate">
                {isLocked
                  ? 'Consumer: PID 104 (Emergency Response) held in critical section'
                  : 'Unlocked: No active process holding resource mutex'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

