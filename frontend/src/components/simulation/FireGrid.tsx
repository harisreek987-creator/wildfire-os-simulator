import React, { useState } from 'react'
import type { GridCell, Sensor } from '../../types/simulation'
import { GRID_SIZE } from '../../data/mockData'
import { Flame, Radio, Droplets, TreePine, AlertTriangle } from 'lucide-react'

interface FireGridProps {
  cells: GridCell[]
  sensors: Sensor[]
  onCellClick?: (cell: GridCell) => void
}

export const FireGrid: React.FC<FireGridProps> = ({ cells, sensors, onCellClick }) => {
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null)
  const [showCoverage, setShowCoverage] = useState<boolean>(true)

  // Quick lookup for sensors by position
  const getSensorAt = (x: number, y: number): Sensor | undefined => {
    return sensors.find((s) => s.x === x && s.y === y)
  }

  // Check if cell is within any active sensor's detection radius
  const isInsideSensorCoverage = (cellX: number, cellY: number): boolean => {
    return sensors.some((sensor) => {
      const dist = Math.sqrt((sensor.x - cellX) ** 2 + (sensor.y - cellY) ** 2)
      return dist <= sensor.radius
    })
  }

  // Determine cell background & border styling
  const getCellStyles = (cell: GridCell) => {
    const inCoverage = showCoverage && isInsideSensorCoverage(cell.x, cell.y)

    switch (cell.state) {
      case 'burning':
        return 'bg-gradient-to-br from-amber-400 via-orange-600 to-red-600 text-amber-100 shadow-md shadow-orange-600/60 border-orange-300 animate-pulse font-bold'
      case 'burned':
        return 'bg-slate-900 text-slate-600 border-slate-850'
      case 'water':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60 shadow-sm shadow-cyan-950/40'
      case 'healthy':
      default:
        return inCoverage
          ? 'bg-emerald-950/50 text-emerald-500 border-emerald-700/50 hover:border-emerald-400 hover:bg-emerald-900/40'
          : 'bg-emerald-950/30 text-emerald-700/70 border-emerald-900/20 hover:border-emerald-600/60 hover:bg-emerald-900/30'
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Grid Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          FOREST CELLULAR GRID (20 × 20)
        </div>

        <div className="flex items-center gap-2">
          {/* Coverage Toggle */}
          <button
            onClick={() => setShowCoverage(!showCoverage)}
            aria-label="Toggle sensor radar coverage overlay"
            aria-pressed={showCoverage}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
              showCoverage
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {showCoverage ? 'RADAR COVERAGE: ON' : 'RADAR COVERAGE: OFF'}
          </button>

          {hoveredCell ? (
            <div className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
              Cell ({hoveredCell.x}, {hoveredCell.y}) —{' '}
              <span className="uppercase font-bold">{hoveredCell.state}</span>
              {hoveredCell.sensorId && ` | ${hoveredCell.sensorId}`}
            </div>
          ) : (
            <div className="text-slate-500 text-[11px] hidden sm:block">Click cell to ignite</div>
          )}
        </div>
      </div>

      {/* Grid Canvas Container */}
      <div className="w-full aspect-square max-w-[560px] mx-auto bg-slate-950 border border-slate-800 rounded-lg p-2 sm:p-2.5 shadow-inner overflow-hidden">
        <div
          className="grid gap-0.5 sm:gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const sensor = getSensorAt(cell.x, cell.y)
            const cellKey = `${cell.x}-${cell.y}`

            return (
              <button
                key={cellKey}
                onClick={() => onCellClick?.(cell)}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                aria-label={`Cell (${cell.x}, ${cell.y}), state: ${cell.state}${sensor ? `, sensor ${sensor.id}` : ''}`}
                className={`relative flex items-center justify-center rounded transition-all duration-150 border text-[10px] focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 cursor-pointer ${getCellStyles(
                  cell
                )}`}
                title={`Cell (${cell.x}, ${cell.y}): ${cell.state.toUpperCase()}${
                  sensor ? ` | Sensor ${sensor.id} (${sensor.status})` : ''
                }`}
              >
                {/* Cell icon based on state */}
                {cell.state === 'burning' && (
                  <Flame className="w-3 h-3 text-amber-200 animate-bounce" />
                )}
                {cell.state === 'water' && (
                  <Droplets className="w-2.5 h-2.5 text-cyan-400 opacity-70" />
                )}
                {cell.state === 'healthy' && !sensor && (
                  <TreePine className="w-2.5 h-2.5 text-emerald-700/60" />
                )}

                {/* Sensor indicator badge overlay */}
                {sensor && (
                  <div
                    className={`absolute -top-1 -right-1 p-0.5 rounded-full z-10 shadow ${
                      sensor.status === 'DETECTED'
                        ? 'bg-red-600 text-white animate-ping ring-2 ring-red-400'
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}
                  >
                    {sensor.status === 'DETECTED' ? (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    ) : (
                      <Radio className="w-2.5 h-2.5" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-700" />
          <span>Healthy Forest</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-600 border border-orange-400 animate-pulse" />
          <span>Active Fire</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
          <span>Burned / Charred</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800" />
          <span>Water Barrier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Sensor Node</span>
        </div>
      </div>
    </div>
  )
}
