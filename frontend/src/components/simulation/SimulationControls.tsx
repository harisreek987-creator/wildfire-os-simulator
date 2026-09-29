import React from 'react'
import { Play, Pause, RotateCcw, FastForward, Sliders, StepForward, Compass } from 'lucide-react'

export type ScenarioPreset = 'STANDARD' | 'HIGH_WIND' | 'RAPID_SPREAD' | 'SENSOR_CHALLENGE'

interface SimulationControlsProps {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  speed: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onStep?: () => void
  onSpeedChange: (speed: number) => void
  onSelectScenario?: (preset: ScenarioPreset) => void
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  status,
  speed,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep,
  onSpeedChange,
  onSelectScenario,
}) => {
  const speeds = [1, 2, 5, 10]

  const presets: { key: ScenarioPreset; label: string; desc: string }[] = [
    { key: 'STANDARD', label: 'Standard', desc: 'N Wind, Mid Speed' },
    { key: 'HIGH_WIND', label: 'High Gale', desc: 'W Wind (High)' },
    { key: 'RAPID_SPREAD', label: 'Rapid Spread', desc: 'S Wind (2x Speed)' },
    { key: 'SENSOR_CHALLENGE', label: 'Perimeter Test', desc: 'E Wind, Far Corner' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-amber-500" />
          Simulation Control Deck
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          STATE:
          <span
            className={`font-semibold px-2 py-0.5 rounded ${
              status === 'RUNNING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : status === 'PAUSED'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {status === 'IDLE' && (
          <button
            onClick={onStart}
            aria-label="Start wildfire simulation"
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-emerald-950 border border-emerald-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Play className="w-4 h-4 fill-current" />
            START SIM
          </button>
        )}

        {status === 'RUNNING' && (
          <button
            onClick={onPause}
            aria-label="Pause wildfire simulation"
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-amber-950 border border-amber-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Pause className="w-4 h-4 fill-current" />
            PAUSE
          </button>
        )}

        {status === 'PAUSED' && (
          <button
            onClick={onResume}
            aria-label="Resume wildfire simulation"
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-blue-950 border border-blue-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME
          </button>
        )}

        {/* STEP Single-Tick Button */}
        <button
          onClick={onStep}
          disabled={status === 'RUNNING'}
          aria-label="Step simulation forward by one tick"
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 font-mono text-xs font-bold rounded-lg transition border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            status === 'RUNNING'
              ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 border-slate-700 cursor-pointer'
          }`}
          title="Advance simulation by exactly 1 tick"
        >
          <StepForward className="w-3.5 h-3.5 text-cyan-400" />
          STEP (1s)
        </button>

        {/* RESET Button */}
        <button
          onClick={onReset}
          aria-label="Reset simulation to initial state"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 font-mono text-xs font-bold rounded-lg transition border border-slate-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          RESET
        </button>

        {/* Speed Selector */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <FastForward className="w-3 h-3 text-amber-500" />
            SPEED:
          </span>
          <div className="flex gap-1" role="group" aria-label="Simulation speed selection">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                aria-label={`Set speed to ${s}x`}
                aria-pressed={speed === s}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                  speed === s
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      {onSelectScenario && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 font-mono">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Compass className="w-3 h-3 text-amber-400" />
            QUICK SCENARIO PRESETS:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="group" aria-label="Scenario presets">
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelectScenario(p.key)}
                aria-label={`Load preset scenario: ${p.label}, ${p.desc}`}
                className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition text-[11px] group cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
              >
                <div className="font-bold text-slate-300 group-hover:text-amber-400">{p.label}</div>
                <div className="text-[9px] text-slate-500 truncate">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
