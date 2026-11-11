import React from 'react'
import type { SimulationStats } from '../../types/simulation'
import { StatisticsPanel } from '../statistics/StatisticsPanel'
import { DetectionComparison } from '../comparison/DetectionComparison'
import { BarChart3, Info, PieChart } from 'lucide-react'

interface AnalyticsViewProps {
  stats: SimulationStats
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const healthyPct = ((stats.healthyCells / (stats.totalCells || 400)) * 100).toFixed(1)
  const burningPct = ((stats.burningCells / (stats.totalCells || 400)) * 100).toFixed(1)
  const burnedPct = ((stats.burnedCells / (stats.totalCells || 400)) * 100).toFixed(1)
  const waterPct = ((stats.waterCells / (stats.totalCells || 400)) * 100).toFixed(1)

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                  Wildfire Analytics &amp; Comparative Benchmark
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Cellular Automata Damage Mitigation Metrics &amp; Early vs. Late Detection Experiment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[11px]">
              GRID: {stats.totalCells || 400} CELLS (20×20)
            </span>
          </div>
        </div>

        {/* Live Telemetry KPI Bar */}
        <StatisticsPanel stats={stats} />
      </div>

      {/* 2. Educational Methodology Notice */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 shadow-md">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <div className="font-bold text-slate-200">
            Simulation-Based Comparative Evaluation Methodology
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The comparative benchmark runs two deterministic simulations from identical initial conditions
            (seed 42, identical 20×20 forest grid, center ignition at (10, 10), and north wind vector).
            The experimental variable is solely <strong>detection latency</strong> (0s instant vs configurable 4–10s delayed alert).
            This demonstrates operating systems process priority preemption and early emergency response effectiveness.
          </p>
        </div>
      </div>

      {/* 3. Forest Sector Distribution Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-cyan-400" />
            Live Sector Canopy Partitioning
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            CANOPY PRESERVATION INDEX
          </span>
        </div>

        {/* Proportion Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${healthyPct}%` }}
              title={`Healthy: ${healthyPct}%`}
            />
            <div
              className="bg-orange-500 h-full transition-all duration-300 animate-pulse"
              style={{ width: `${burningPct}%` }}
              title={`Burning: ${burningPct}%`}
            />
            <div
              className="bg-slate-700 h-full transition-all duration-300"
              style={{ width: `${burnedPct}%` }}
              title={`Burned: ${burnedPct}%`}
            />
            <div
              className="bg-cyan-600 h-full transition-all duration-300"
              style={{ width: `${waterPct}%` }}
              title={`Water: ${waterPct}%`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Healthy Canopy
              </span>
              <span className="font-bold text-slate-200">{stats.healthyCells} ({healthyPct}%)</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-orange-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                Active Fire
              </span>
              <span className="font-bold text-slate-200">{stats.burningCells} ({burningPct}%)</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                Burned Damage
              </span>
              <span className="font-bold text-slate-200">{stats.burnedCells} ({burnedPct}%)</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600" />
                Water Barriers
              </span>
              <span className="font-bold text-slate-200">{stats.waterCells} ({waterPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Primary Experiment: Early vs Late Detection Benchmark */}
      <DetectionComparison />
    </div>
  )
}

