import React from 'react'
import { Flame, ShieldCheck, CheckCircle2, AlertTriangle, Droplets, TreePine, Clock, Radio } from 'lucide-react'
import type { Sensor } from '../../types/simulation'

interface IncidentStatusProps {
  burningCells: number
  burnedCells: number
  healthyCells: number
  waterCells: number
  totalCells: number
  simulationTime: number
  sensors: Sensor[]
  firstDetectionTime?: number | null
}

export const IncidentStatus: React.FC<IncidentStatusProps> = ({
  burningCells,
  burnedCells,
  healthyCells,
  waterCells,
  totalCells,
  simulationTime,
  sensors,
  firstDetectionTime,
}) => {
  // Determine actual incident status from real simulation state
  const isBurning = burningCells > 0
  const isContained = !isBurning && burnedCells > 0

  const incidentState = isBurning
    ? {
        label: 'ACTIVE FIRE INCIDENT',
        description: 'Fire propagation underway. OS priority preemption engaged.',
        color: 'text-rose-400',
        bg: 'bg-rose-950/40 border-rose-800/60 shadow-rose-950/40',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: <Flame className="w-4 h-4 text-rose-400 animate-pulse" />,
        dot: 'bg-rose-500 animate-ping',
      }
    : isContained
    ? {
        label: 'FIRE CONTAINED',
        description: 'Perimeter stabilized. No active propagating flame cells.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/30 border-emerald-800/50 shadow-emerald-950/30',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        dot: 'bg-emerald-400',
      }
    : {
        label: 'NO ACTIVE FIRE',
        description: 'Sector secure. Cellular grid monitoring nominal.',
        color: 'text-emerald-400',
        bg: 'bg-slate-900 border-slate-800 shadow-slate-950/40',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        dot: 'bg-emerald-400',
      }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Check sensor detection
  const detectedSensors = sensors.filter((s) => s.status === 'DETECTED')
  const activeSensors = sensors.filter((s) => s.status !== 'INACTIVE')

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col gap-3 shadow-xl">
      {/* Top Banner: Incident Level + Detection Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${incidentState.dot}`}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current" />
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border flex items-center gap-1.5 ${incidentState.badgeBg}`}
            >
              {incidentState.icon}
              {incidentState.label}
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              {incidentState.description}
            </span>
          </div>
        </div>

        {/* Telemetry Sensor Notice */}
        <div className="flex items-center gap-2 text-[11px]">
          {detectedSensors.length > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>
                ALERT: {detectedSensors.map((s) => s.id).join(', ')} DETECTED FIRE
                {firstDetectionTime !== null && firstDetectionTime !== undefined && (
                  <span className="ml-1 text-rose-200 font-bold">(T+{firstDetectionTime}s)</span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                RADAR: {activeSensors.length}/{sensors.length || 4} NODES MONITORING
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>T+{formatTime(simulationTime)}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 font-mono text-xs">
        {/* Burning */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>BURNING CELLS</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-rose-400">{burningCells}</span>
            <span className="text-[10px] text-slate-500">
              ({((burningCells / (totalCells || 400)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Burned */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>BURNED AREA</span>
            <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-300">{burnedCells}</span>
            <span className="text-[10px] text-slate-500">
              ({((burnedCells / (totalCells || 400)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Healthy Forest */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>HEALTHY CANOPY</span>
            <TreePine className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400">{healthyCells}</span>
            <span className="text-[10px] text-slate-500">
              ({((healthyCells / (totalCells || 400)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Water Barriers */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>WATER BARRIERS</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-400">{waterCells}</span>
            <span className="text-[10px] text-slate-500">
              ({((waterCells / (totalCells || 400)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Total Sector */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-col justify-between hidden lg:flex">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>GRID DIMENSION</span>
            <span className="text-[10px] text-slate-500">20×20</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-200">{totalCells || 400}</span>
            <span className="text-[10px] text-slate-500">Total Cells</span>
          </div>
        </div>
      </div>
    </div>
  )
}
