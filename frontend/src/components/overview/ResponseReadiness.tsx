import React from 'react'
import { Radio, Users, Droplets, Plane, AlertTriangle, CheckCircle2, Shield } from 'lucide-react'
import type { ResourceItem, Sensor } from '../../types/simulation'

interface ResponseReadinessProps {
  resources: ResourceItem[]
  sensors: Sensor[]
}

export const ResponseReadiness: React.FC<ResponseReadinessProps> = ({ resources, sensors }) => {
  // Extract specific resources from backend list
  const firefighters = resources.find(
    (r) => r.id === 'firefighters' || r.name.toLowerCase().includes('firefighter')
  )
  const water = resources.find(
    (r) => r.id === 'water' || r.name.toLowerCase().includes('water')
  )
  const drones = resources.find(
    (r) => r.id === 'drones' || r.name.toLowerCase().includes('drone')
  )

  const activeSensorsCount = sensors.filter((s) => s.status !== 'INACTIVE').length
  const detectedSensors = sensors.filter((s) => s.status === 'DETECTED')

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          Emergency Response Readiness
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          DISPATCH READY
        </span>
      </div>

      {/* 4 Readiness Subsections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 font-mono text-xs">
        {/* 1. Sensor Network */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">Sensor Network</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                detectedSensors.length > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {detectedSensors.length > 0 ? `${detectedSensors.length} DETECTED` : `${activeSensorsCount}/${sensors.length || 4} ACTIVE`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
            {sensors.map((s) => (
              <div
                key={s.id}
                className={`p-1.5 rounded border flex items-center justify-between ${
                  s.status === 'DETECTED'
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="truncate max-w-[70px]">{s.id}</span>
                <span className="text-[9px] uppercase flex items-center gap-1">
                  {s.status === 'DETECTED' ? (
                    <>
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                      FIRE
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      OK
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Firefighter Resources */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-slate-200">Firefighter Units</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {firefighters ? `${firefighters.total} ${firefighters.unit}` : '20 personnel'}
            </span>
          </div>

          {/* Availability Breakdown */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
            <span className="text-emerald-400 font-semibold">
              Available: {firefighters ? firefighters.available : 20}
            </span>
            <span className="text-amber-400 font-semibold">
              In Use: {firefighters ? firefighters.inUse : 0}
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>DEPLOYMENT</span>
              <span>
                {firefighters
                  ? `${Math.round((firefighters.inUse / (firefighters.total || 1)) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{
                  width: firefighters
                    ? `${(firefighters.inUse / (firefighters.total || 1)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Water Reserves */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">Water Reserves</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {water ? `${water.total} ${water.unit}` : '100 kL'}
            </span>
          </div>

          {/* Availability Breakdown */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
            <span className="text-emerald-400 font-semibold">
              Available: {water ? water.available : 100} kL
            </span>
            <span className="text-cyan-400 font-semibold">
              Used: {water ? water.inUse : 0} kL
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>RESERVE LEVEL</span>
              <span>
                {water
                  ? `${Math.round((water.available / (water.total || 1)) * 100)}%`
                  : '100%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{
                  width: water
                    ? `${(water.available / (water.total || 1)) * 100}%`
                    : '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Drone Resources */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">Surveillance Drones</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {drones ? `${drones.total} ${drones.unit}` : '4 units'}
            </span>
          </div>

          {/* Availability Breakdown */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
            <span className="text-emerald-400 font-semibold">
              Standby: {drones ? drones.available : 4}
            </span>
            <span className="text-amber-400 font-semibold">
              Airborne: {drones ? drones.inUse : 0}
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>ACTIVE AIR COVER</span>
              <span>
                {drones
                  ? `${Math.round((drones.inUse / (drones.total || 1)) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{
                  width: drones
                    ? `${(drones.inUse / (drones.total || 1)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

