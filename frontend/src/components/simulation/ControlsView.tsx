import React, { useState } from 'react'
import {
  Sliders,
  Flame,
  Wind,
  Gauge,
  Compass,
  Crosshair,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { WindDirection, WindStrength } from '../../types/simulation'
import { SimulationControls, type ScenarioPreset } from './SimulationControls'
import { WindControls } from './WindControls'

interface ControlsViewProps {
  simStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  speed: number
  wind: { direction: WindDirection; strength: WindStrength }
  simulationTime: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onStep: () => void
  onSpeedChange: (speed: number) => void
  onWindDirectionChange: (dir: WindDirection) => void
  onWindStrengthChange: (str: WindStrength) => void
  onSelectScenario: (preset: ScenarioPreset) => void
  onIgniteCoord: (row: number, col: number) => void
}

export const ControlsView: React.FC<ControlsViewProps> = ({
  simStatus,
  speed,
  wind,
  simulationTime,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep,
  onSpeedChange,
  onWindDirectionChange,
  onWindStrengthChange,
  onSelectScenario,
  onIgniteCoord,
}) => {
  const [targetRow, setTargetRow] = useState<number>(10)
  const [targetCol, setTargetCol] = useState<number>(10)
  const [lastIgnitedMsg, setLastIgnitedMsg] = useState<string | null>(null)

  const handleIgnite = (e: React.FormEvent) => {
    e.preventDefault()
    const r = Math.max(0, Math.min(19, Number(targetRow)))
    const c = Math.max(0, Math.min(19, Number(targetCol)))
    onIgniteCoord(r, c)
    setLastIgnitedMsg(`Ignition pulse sent to [${r}, ${c}]`)
    setTimeout(() => setLastIgnitedMsg(null), 3000)
  }

  const quickIgnitePoints = [
    { label: 'Grid Center', row: 10, col: 10 },
    { label: 'North Forest', row: 2, col: 10 },
    { label: 'South Sector', row: 17, col: 10 },
    { label: 'West Perimeter', row: 10, col: 2 },
    { label: 'East Flank', row: 10, col: 17 },
  ]

  const scenarios: {
    key: ScenarioPreset
    title: string
    windDir: WindDirection
    windStr: WindStrength
    speedMult: number
    ignition: string
    description: string
  }[] = [
    {
      key: 'STANDARD',
      title: 'Standard Baseline',
      windDir: 'NORTH',
      windStr: 'MEDIUM',
      speedMult: 1,
      ignition: '[10, 10]',
      description: 'Balanced conditions. Central ignition point with moderate northern wind vector.',
    },
    {
      key: 'HIGH_WIND',
      title: 'High Gale Force',
      windDir: 'WEST',
      windStr: 'HIGH',
      speedMult: 1,
      ignition: '[10, 5]',
      description: 'Severe western gale creating rapid directional propagation downwind toward eastern sectors.',
    },
    {
      key: 'RAPID_SPREAD',
      title: 'Rapid Spread Stress',
      windDir: 'SOUTH',
      windStr: 'HIGH',
      speedMult: 2,
      ignition: '[5, 5]',
      description: 'Double simulation speed (2x tick rate) to stress-test priority scheduler preemption.',
    },
    {
      key: 'SENSOR_CHALLENGE',
      title: 'Perimeter Sensor Test',
      windDir: 'EAST',
      windStr: 'HIGH',
      speedMult: 1,
      ignition: '[2, 17]',
      description: 'Corner ignition far from immediate sensor radii, demonstrating detection delay metrics.',
    },
  ]

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                  Mission Control &amp; Simulation Parameters
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  DISPATCH CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Execute simulation lifecycle state, atmospheric wind vectors, scenario presets, and manual ignition triggers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TICK: {simulationTime}s</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold text-[11px] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>SPEED: {speed}x</span>
            </div>
          </div>
        </div>

        {/* Status Indicators Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">ENGINE STATE:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                simStatus === 'RUNNING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : simStatus === 'PAUSED'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {simStatus}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">WIND VECTOR:</span>
            <span className="text-cyan-300 font-bold text-[11px] flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              {wind.direction} ({wind.strength})
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">TICK INTERVAL:</span>
            <span className="text-emerald-400 font-bold text-[11px]">
              {Math.round(1000 / speed)} ms
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">GRID MATRIX:</span>
            <span className="text-slate-300 font-bold text-[11px]">
              20 × 20 (400)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Core Interactive Control Decks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Simulation Controls Deck */}
        <SimulationControls
          status={simStatus}
          speed={speed}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onReset={onReset}
          onStep={onStep}
          onSpeedChange={onSpeedChange}
          onSelectScenario={onSelectScenario}
        />

        {/* Wind Vector Controls Deck */}
        <WindControls
          direction={wind.direction}
          strength={wind.strength}
          onDirectionChange={onWindDirectionChange}
          onStrengthChange={onWindStrengthChange}
        />
      </div>

      {/* 3. Tactical Manual Ignition Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-xs">
            <Crosshair className="w-4 h-4 text-red-400" />
            Tactical Coordinate Ignition Dispatch
          </div>
          {lastIgnitedMsg && (
            <span className="text-amber-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              {lastIgnitedMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Coordinate Form */}
          <form
            onSubmit={handleIgnite}
            className="md:col-span-6 flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800"
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="target-row" className="text-slate-400 text-[11px] font-bold">ROW:</label>
              <input
                id="target-row"
                type="number"
                min={0}
                max={19}
                value={targetRow}
                onChange={(e) => setTargetRow(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center font-bold focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="target-col" className="text-slate-400 text-[11px] font-bold">COL:</label>
              <input
                id="target-col"
                type="number"
                min={0}
                max={19}
                value={targetCol}
                onChange={(e) => setTargetCol(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center font-bold focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded transition border border-red-500 shadow cursor-pointer text-xs"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              IGNITE TARGET
            </button>
          </form>

          {/* Quick Target Presets */}
          <div className="md:col-span-6 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 w-full mb-0.5">QUICK COORDINATES:</span>
            {quickIgnitePoints.map((pt) => (
              <button
                key={pt.label}
                type="button"
                onClick={() => {
                  setTargetRow(pt.row)
                  setTargetCol(pt.col)
                  onIgniteCoord(pt.row, pt.col)
                  setLastIgnitedMsg(`Ignited ${pt.label} [${pt.row}, ${pt.col}]`)
                  setTimeout(() => setLastIgnitedMsg(null), 3000)
                }}
                className="py-1 px-2.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-1 cursor-pointer"
              >
                <span>{pt.label}</span>
                <span className="text-slate-400">[{pt.row},{pt.col}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Scenario Presets Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Curated Academic Scenario Matrix
          </div>
          <span className="text-[11px] text-slate-400">
            Presets automatically reset and configure wind, speed &amp; ignition coordinates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {scenarios.map((sc) => (
            <div
              key={sc.key}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-3 flex flex-col justify-between gap-3 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-slate-200 text-xs">{sc.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                    {sc.speedMult}x SPEED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-2.5">
                  {sc.description}
                </p>
                <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                  <div className="flex justify-between">
                    <span>WIND:</span>
                    <span className="text-cyan-400 font-bold">{sc.windDir} ({sc.windStr})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGNITION:</span>
                    <span className="text-red-400 font-bold">{sc.ignition}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectScenario(sc.key)}
                className="w-full py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-bold rounded transition cursor-pointer text-[11px] flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                LOAD SCENARIO
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Engine Operational Reference */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-[11px] flex flex-col gap-2 font-sans">
        <div className="font-mono font-bold text-slate-300 flex items-center gap-1.5 text-xs uppercase">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Simulation Engine Mechanics Reference
        </div>
        <p className="leading-relaxed">
          The Python simulation engine operates on a discrete time-step cellular automaton model. In each tick,
          burning cells evaluate orthogonal and diagonal neighbors using a base ignition probability adjusted by the
          atmospheric wind vector. When a burning cell enters within sensor detection perimeter (R=3 to 4 cells), an interrupt event is dispatched
          to the Operating System scheduler, triggering high-priority Emergency Response preemption.
        </p>
      </div>
    </div>
  )
}

