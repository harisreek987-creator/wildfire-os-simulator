import React from 'react'
import type { Sensor } from '../../types/simulation'
import { Radio, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface SensorPanelProps {
  sensors: Sensor[]
  selectedSensorId?: string
  onSelectSensor?: (id: string) => void
}

export const SensorPanel: React.FC<SensorPanelProps> = ({
  sensors,
  selectedSensorId,
  onSelectSensor,
}) => {
  const activeCount = sensors.filter((s) => s.status !== 'INACTIVE').length

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          Sensor Nodes Telemetry ({sensors.length})
        </div>
        <span className="text-[11px] text-emerald-400 font-mono">
          {activeCount}/{sensors.length} ACTIVE
        </span>
      </div>

      {/* Sensor Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
        {sensors.map((sensor) => {
          const isSelected = selectedSensorId === sensor.id

          return (
            <div
              key={sensor.id}
              role="button"
              tabIndex={0}
              aria-label={`Sensor ${sensor.id}: ${sensor.name}, status ${sensor.status}, at coordinates (${sensor.x}, ${sensor.y})`}
              onClick={() => onSelectSensor?.(sensor.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectSensor?.(sensor.id)
                }
              }}
              className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950'
                  : sensor.status === 'DETECTED'
                  ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-950'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">{sensor.id}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[110px]">
                    {sensor.name}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    sensor.status === 'DETECTED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : sensor.status === 'MONITORING'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {sensor.status === 'DETECTED' ? (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  ) : sensor.status === 'MONITORING' ? (
                    <Eye className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  {sensor.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                <span>
                  GRID: ({sensor.x}, {sensor.y})
                </span>
                <span>RADIUS: {sensor.radius} CELLS</span>
              </div>

              {sensor.lastDetectionTime !== undefined && (
                <div className="text-[10px] text-red-400 font-semibold flex items-center justify-between pt-1 border-t border-red-950/40">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-red-400" /> FIRE DETECTED:
                  </span>
                  <span>{sensor.lastDetectionTime}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
