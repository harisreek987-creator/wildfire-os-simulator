import React from 'react'
import type { ResourceItem } from '../../types/simulation'
import { Box, Users, Droplets, Radio } from 'lucide-react'

interface ResourcePanelProps {
  resources: ResourceItem[]
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources }) => {
  const getResourceIcon = (name: string) => {
    switch (name) {
      case 'Firefighters':
        return <Users className="w-4 h-4 text-orange-400" />
      case 'Water Supply':
        return <Droplets className="w-4 h-4 text-cyan-400" />
      case 'Surveillance Drones':
        return <Radio className="w-4 h-4 text-amber-400" />
      default:
        return <Box className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Box className="w-4 h-4 text-amber-500" />
          Emergency System Resource Allocator
        </div>
        <span className="text-[10px] text-slate-500 font-mono">MUTEX LOCK OK</span>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        {resources.map((res) => {
          const usedPercent = Math.round((res.inUse / res.total) * 100)

          return (
            <div
              key={res.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getResourceIcon(res.name)}
                  <span className="font-bold text-slate-200">{res.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {res.total} {res.unit}
                </span>
              </div>

              {/* Stats Breakdown */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                <span className="text-emerald-400 font-semibold">
                  AVAIL: {res.available}
                </span>
                <span className="text-amber-400 font-semibold">IN USE: {res.inUse}</span>
              </div>

              {/* Usage Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ALLOCATED</span>
                  <span>{usedPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      usedPercent > 80
                        ? 'bg-red-500'
                        : usedPercent > 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
