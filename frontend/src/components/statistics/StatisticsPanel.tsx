import React from 'react'
import type { SimulationStats } from '../../types/simulation'
import { Flame, FlameKindling, ShieldAlert, Activity, Radio, Clock } from 'lucide-react'

interface StatisticsPanelProps {
  stats: SimulationStats
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const statCards = [
    {
      title: 'BURNING CELLS',
      value: stats.burningCells,
      subtext: `${((stats.burningCells / stats.totalCells) * 100).toFixed(1)}% of grid`,
      icon: <Flame className="w-5 h-5 text-amber-500 animate-pulse" />,
      colorClass: 'border-orange-500/30 bg-orange-950/20 text-orange-400',
    },
    {
      title: 'BURNED CELLS',
      value: stats.burnedCells,
      subtext: `${((stats.burnedCells / stats.totalCells) * 100).toFixed(1)}% total damage`,
      icon: <FlameKindling className="w-5 h-5 text-slate-500" />,
      colorClass: 'border-slate-800 bg-slate-950 text-slate-300',
    },
    {
      title: 'DETECTION LATENCY',
      value: stats.detectionTimeSeconds !== null ? formatTime(stats.detectionTimeSeconds) : 'NO DETECTION',
      subtext: stats.detectionTimeSeconds !== null ? 'Sensor alert triggered' : 'Monitoring grid...',
      icon: <ShieldAlert className="w-5 h-5 text-emerald-400" />,
      colorClass: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
    },
    {
      title: 'FIRE INTENSITY',
      value: stats.fireIntensity,
      subtext: 'Propagation index',
      icon: <Activity className="w-5 h-5 text-red-500" />,
      colorClass: 'border-red-500/30 bg-red-950/20 text-red-400',
    },
    {
      title: 'ACTIVE SENSORS',
      value: `${stats.activeSensors} / ${stats.totalSensors}`,
      subtext: '100% coverage',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      colorClass: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
    },
    {
      title: 'SIMULATION CLOCK',
      value: stats.elapsedTime,
      subtext: `Speed ${stats.simulationSpeed}x`,
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      colorClass: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
    },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-400" />
          Live Telemetry &amp; Statistics
        </div>
        <span className="text-[10px] text-slate-500 font-mono">GRID 20×20 STATE</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex flex-col justify-between gap-1 shadow-sm ${card.colorClass}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider truncate">
                {card.title}
              </span>
              {card.icon}
            </div>

            <div className="text-lg font-black tracking-tight">{card.value}</div>

            <div className="text-[10px] opacity-70 truncate">{card.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
