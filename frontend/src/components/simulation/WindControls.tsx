import React from 'react'
import { Wind, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react'
import type { WindDirection, WindStrength } from '../../types/simulation'

interface WindControlsProps {
  direction: WindDirection
  strength: WindStrength
  onDirectionChange: (direction: WindDirection) => void
  onStrengthChange: (strength: WindStrength) => void
}

export const WindControls: React.FC<WindControlsProps> = ({
  direction,
  strength,
  onDirectionChange,
  onStrengthChange,
}) => {
  const directions: { key: WindDirection; label: string; icon: React.ReactNode }[] = [
    { key: 'NORTH', label: 'N', icon: <ArrowUp className="w-4 h-4" /> },
    { key: 'SOUTH', label: 'S', icon: <ArrowDown className="w-4 h-4" /> },
    { key: 'EAST', label: 'E', icon: <ArrowRight className="w-4 h-4" /> },
    { key: 'WEST', label: 'W', icon: <ArrowLeft className="w-4 h-4" /> },
  ]

  const strengths: WindStrength[] = ['LOW', 'MEDIUM', 'HIGH']

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Wind className="w-4 h-4 text-cyan-400" />
          Atmospheric Wind Vector
        </div>
        <div className="text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          {direction} / {strength}
        </div>
      </div>

      {/* Direction & Strength Selectors */}
      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        {/* Wind Direction Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 block font-medium">DIRECTION</label>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Wind direction options">
            {directions.map((d) => (
              <button
                key={d.key}
                onClick={() => onDirectionChange(d.key)}
                aria-label={`Set wind direction to ${d.key}`}
                aria-pressed={direction === d.key}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  direction === d.key
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm shadow-cyan-950'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {d.icon}
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wind Strength Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 block font-medium">STRENGTH</label>
          <div className="flex flex-col gap-1.5" role="group" aria-label="Wind strength options">
            {strengths.map((s) => (
              <button
                key={s}
                onClick={() => onStrengthChange(s)}
                aria-label={`Set wind strength to ${s}`}
                aria-pressed={strength === s}
                className={`py-1.5 px-3 rounded-lg text-center font-bold text-[11px] transition border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  strength === s
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
