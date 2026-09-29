import React, { useState, useEffect } from 'react'
import type { DetectionComparisonData } from '../../types/simulation'
import { fetchDetectionComparison } from '../../services/comparisonService'
import {
  Zap,
  Clock,
  Flame,
  ShieldAlert,
  BarChart3,
  PlayCircle,
  RefreshCw,
  TrendingDown,
  CheckCircle2,
  Users,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

interface DetectionComparisonProps {
  initialData?: DetectionComparisonData | null
}

export const DetectionComparison: React.FC<DetectionComparisonProps> = ({ initialData }) => {
  const [data, setData] = useState<DetectionComparisonData | null>(initialData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [delay, setDelay] = useState<number>(6)
  const [error, setError] = useState<string | null>(null)

  const runExperiment = async (selectedDelay: number = delay) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDetectionComparison({
        lateDetectionDelay: selectedDelay,
        seed: 42,
        ignitionRow: 10,
        ignitionCol: 10,
        spreadProbability: 0.35,
        burnDuration: 3,
        maxSteps: 35,
      })
      setData(result)
    } catch (err) {
      console.error('Failed to run detection comparison experiment:', err)
      setError('Unable to reach simulation engine. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!data) {
      runExperiment(delay)
    }
  }, [])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Header & Experiment Trigger */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono gap-3">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-sm">
          <Zap className="w-4 h-4 text-amber-500" />
          Primary Experiment: Early vs. Late Detection Benchmark
        </div>

        <div className="flex items-center gap-3">
          {/* Delay Selector */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <label htmlFor="delay-select" className="cursor-pointer">Late Delay:</label>
            <select
              id="delay-select"
              value={delay}
              aria-label="Select late detection delay in seconds"
              onChange={(e) => {
                const newDelay = Number(e.target.value)
                setDelay(newDelay)
                runExperiment(newDelay)
              }}
              disabled={loading}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-bold outline-none cursor-pointer focus:ring-1 focus:ring-amber-500"
            >
              <option value={4}>4s delay</option>
              <option value={6}>6s delay (standard)</option>
              <option value={8}>8s delay</option>
              <option value={10}>10s delay</option>
            </select>
          </div>

          {/* Run Experiment Button */}
          <button
            onClick={() => runExperiment(delay)}
            disabled={loading}
            aria-label="Run early versus late detection benchmark comparison"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                SIMULATING RUNS...
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                RUN DETECTION COMPARISON
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* OS Impact Delta Summary Banner */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                EARLY DETECTION SAVED{' '}
                <span className="font-bold text-emerald-400 text-sm">
                  {data.summary.burnedCellsDifference} CELLS
                </span>{' '}
                ({data.summary.savedCellsPercent} DAMAGE MITIGATION)
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>
                Peak Fire Reduction:{' '}
                <strong className="text-emerald-400">
                  -{data.summary.peakBurningDifference} cells
                </strong>
              </span>
              {data.summary.containmentTimeDifference !== null && (
                <span>
                  Containment Speedup:{' '}
                  <strong className="text-emerald-400">
                    {data.summary.containmentTimeDifference}s faster
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Side-by-side Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Early Detection Card */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  EARLY DETECTION (FAST ALERT)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  DELAY: 0s (INSTANT)
                </span>
              </div>

              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> First Detection:
                  </span>
                  <span className="font-bold text-emerald-400">
                    T+{data.early.detectionTime ?? 0}s
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" /> Total Burned Cells:
                  </span>
                  <span className="font-bold text-emerald-300">
                    {data.early.totalBurnedCells} cells
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Peak Fire Size:
                  </span>
                  <span className="font-bold text-emerald-300">
                    {data.early.peakBurningCells} concurrent cells
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Total Forest Area Burned:
                  </span>
                  <span className="font-bold text-emerald-300">
                    {data.early.fireSpreadPercent}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Resources Allocated:
                  </span>
                  <span className="font-semibold text-slate-300 text-[11px]">
                    {data.early.firefightersAllocated} FF, {data.early.waterAllocated} kL Water, {data.early.dronesAllocated} Drones
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-emerald-900/40 font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Containment Time:
                  </span>
                  <span className="text-emerald-400">
                    {data.early.containmentTime !== null
                      ? `T+${data.early.containmentTime}s`
                      : 'Not Contained'}
                  </span>
                </div>
              </div>
            </div>

            {/* Late Detection Card */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
                <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  LATE DETECTION (DELAYED ALERT)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  DELAY: +{data.late.detectionDelay}s
                </span>
              </div>

              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" /> First Detection:
                  </span>
                  <span className="font-bold text-rose-400">
                    T+{data.late.detectionTime ?? 0}s
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Total Burned Cells:
                  </span>
                  <span className="font-bold text-rose-300">
                    {data.late.totalBurnedCells} cells
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-rose-400" /> Peak Fire Size:
                  </span>
                  <span className="font-bold text-rose-300">
                    {data.late.peakBurningCells} concurrent cells
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Total Forest Area Burned:
                  </span>
                  <span className="font-bold text-rose-300">
                    {data.late.fireSpreadPercent}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-rose-400" /> Resources Allocated:
                  </span>
                  <span className="font-semibold text-slate-300 text-[11px]">
                    {data.late.firefightersAllocated} FF, {data.late.waterAllocated} kL Water, {data.late.dronesAllocated} Drones
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-rose-900/40 font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Containment Time:
                  </span>
                  <span className="text-rose-400">
                    {data.late.containmentTime !== null
                      ? `T+${data.late.containmentTime}s`
                      : 'Not Contained'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Timeline Chart */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-300 uppercase">
                Step-by-Step Fire Progression Timeline (Burned Cells Accumulation)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                DETERMINISTIC SIMULATION ENGINE (SEED 42)
              </span>
            </div>

            <div className="w-full h-48 font-mono text-xs pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeries} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line
                    type="monotone"
                    dataKey="earlyBurned"
                    name="Early Detection (Burned Cells)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lateBurned"
                    name="Late Detection (Burned Cells)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
