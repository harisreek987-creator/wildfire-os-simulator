import React, { useState } from 'react'
import type { Sensor } from '../../types/simulation'
import { Radio, AlertTriangle, CheckCircle2, Eye, EyeOff, ShieldCheck, Crosshair } from 'lucide-react'

interface SensorsViewProps {
  sensors: Sensor[]
}

export const SensorsView: React.FC<SensorsViewProps> = ({ sensors }) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>('S-02')

  const monitoringCount = sensors.filter((s) => s.status === 'MONITORING').length
  const detectedCount = sensors.filter((s) => s.status === 'DETECTED').length
  const onlineCount = sensors.filter((s) => s.status !== 'INACTIVE').length
  const selectedSensor =
    sensors.find((s) => s.id === selectedSensorId) ||
    sensors[0] ||
    null

  const avgRadius =
    sensors.length > 0
      ? (sensors.reduce((acc, s) => acc + s.radius, 0) / sensors.length).toFixed(2)
      : '3.25'

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Summary Counters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                  Perimeter Sensor Array Telemetry
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {onlineCount}/{sensors.length || 4} NODES ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Early Wildfire Thermal &amp; Infrared Perimeter Detection Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detectedCount > 0 ? (
              <span className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/80 font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {detectedCount} NODE(S) IN ALARM
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SECTOR SECURE
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Sensor Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400">TOTAL SENSORS</span>
            <span className="text-lg font-black text-slate-200 mt-1">{sensors.length || 4} Nodes</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400">MONITORING</span>
            <span className="text-lg font-black text-emerald-400 mt-1">{monitoringCount} Active</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400">FIRE DETECTIONS</span>
            <span className="text-lg font-black text-rose-400 mt-1">{detectedCount} Alarms</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400">AVERAGE RADIUS</span>
            <span className="text-lg font-black text-cyan-400 mt-1">{avgRadius} Cells</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Split: Sensor Nodes Cards & Node Deep Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Sensor Cards List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                Sensor Nodes Topology ({sensors.length})
              </span>
              <span className="text-[10px] text-slate-500">SELECT TO INSPECT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sensors.map((sensor) => {
                const isSelected = selectedSensorId === sensor.id

                return (
                  <div
                    key={sensor.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSensorId(sensor.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedSensorId(sensor.id)
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30'
                        : sensor.status === 'DETECTED'
                        ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs">
                          {sensor.id}
                        </span>
                        <span className="font-bold text-slate-200 text-xs truncate max-w-[120px]">
                          {sensor.name}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          sensor.status === 'DETECTED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : sensor.status === 'MONITORING'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {sensor.status === 'DETECTED' ? (
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                        ) : sensor.status === 'MONITORING' ? (
                          <Eye className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-400" />
                        )}
                        {sensor.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-850 text-slate-400">
                      <div>
                        <span className="text-slate-500 text-[10px] block">GRID LOCATION</span>
                        <span className="text-slate-200 font-bold">({sensor.x}, {sensor.y})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">RADAR RADIUS</span>
                        <span className="text-cyan-400 font-bold">{sensor.radius} Cells</span>
                      </div>
                    </div>

                    {sensor.lastDetectionTime !== undefined && (
                      <div className="text-[10px] text-rose-400 font-semibold flex items-center justify-between pt-1 border-t border-rose-950/60">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> FIRST DETECTION:
                        </span>
                        <span>{sensor.lastDetectionTime}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Node Telemetry & Radar Blueprint */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-200 uppercase">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                Node Inspection: {selectedSensor?.id}
              </div>
              <span className="text-[10px] text-slate-400">ACTIVE PROBE</span>
            </div>

            {selectedSensor && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{selectedSensor.name}</span>
                    <span className="text-amber-400 font-bold">{selectedSensor.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Autonomous infrared and thermal detection outpost scanning surrounding cells for combustion.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">COORDINATES</span>
                    <span className="text-slate-200 font-bold text-sm">
                      Col {selectedSensor.x}, Row {selectedSensor.y}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">RADAR RADIUS</span>
                    <span className="text-cyan-400 font-bold text-sm">
                      {selectedSensor.radius} Cells
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">TELEMETRY STATUS</span>
                    <span
                      className={`font-bold text-sm ${
                        selectedSensor.status === 'DETECTED' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {selectedSensor.status}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">COVERAGE AREA</span>
                    <span className="text-slate-200 font-bold text-sm">
                      ~{Math.round(Math.PI * selectedSensor.radius ** 2)} Cells
                    </span>
                  </div>
                </div>

                {selectedSensor.lastDetectionTime !== undefined ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      FIRE DETECTION RECORDED
                    </div>
                    <p className="text-[11px] text-rose-200/80 font-sans">
                      Combustion detected within the {selectedSensor.radius}-cell radius at simulation step {selectedSensor.lastDetectionTime}.
                      Generated OS Kernel IPC alert to elevate Emergency Response priority.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No combustion detected within radar radius. Grid is nominal.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

