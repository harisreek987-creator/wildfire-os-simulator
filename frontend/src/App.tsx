import React, { useState } from 'react'
import { Header } from './components/layout/Header'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { PlaceholderView } from './components/layout/PlaceholderView'
import { IncidentStatus } from './components/overview/IncidentStatus'
import { ResponseReadiness } from './components/overview/ResponseReadiness'
import { OSMonitorView } from './components/os/OSMonitorView'
import { FireGrid } from './components/simulation/FireGrid'
import { SimulationControls, type ScenarioPreset } from './components/simulation/SimulationControls'
import { WindControls } from './components/simulation/WindControls'

import { useSimulation } from './hooks/useSimulation'
import type { WindDirection, WindStrength, GridCell, NavigationTab } from './types/simulation'

export const App: React.FC = () => {
  // Connect real WebSocket simulation hook at root level (preserved across tab navigation)
  const sim = useSimulation()

  // Active console view
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview')

  // Simulation status calculation
  const simStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' = sim.isRunning
    ? 'RUNNING'
    : sim.simulationTime > 0
    ? 'PAUSED'
    : 'IDLE'

  // Interactive control handlers forwarding commands to Python backend via WebSocket
  const handleStart = () => {
    sim.start()
  }

  const handlePause = () => {
    sim.pause()
  }

  const handleResume = () => {
    sim.resume()
  }

  const handleReset = () => {
    sim.reset()
  }

  const handleStep = () => {
    sim.step()
  }

  const handleSpeedChange = (newSpeed: number) => {
    sim.setSpeed(newSpeed)
  }

  const handleWindDirectionChange = (newDir: WindDirection) => {
    sim.setWind(newDir, sim.wind.strength)
  }

  const handleWindStrengthChange = (newStrength: WindStrength) => {
    sim.setWind(sim.wind.direction, newStrength)
  }

  const handleCellClick = (cell: GridCell) => {
    if (cell.state === 'healthy') {
      sim.ignite(cell.y, cell.x) // row=y, col=x
    }
  }

  // Handle Scenario Presets by orchestrating clean parameter configurations
  const handleSelectScenario = (preset: ScenarioPreset) => {
    sim.reset()
    setTimeout(() => {
      switch (preset) {
        case 'STANDARD':
          sim.setWind('NORTH', 'MEDIUM')
          sim.setSpeed(1)
          sim.ignite(10, 10)
          break
        case 'HIGH_WIND':
          sim.setWind('WEST', 'HIGH')
          sim.setSpeed(1)
          sim.ignite(10, 5)
          break
        case 'RAPID_SPREAD':
          sim.setWind('SOUTH', 'HIGH')
          sim.setSpeed(2)
          sim.ignite(5, 5)
          break
        case 'SENSOR_CHALLENGE':
          sim.setWind('EAST', 'HIGH')
          sim.setSpeed(1)
          sim.ignite(2, 17)
          break
      }
    }, 100)
  }

  return (
    <DashboardLayout
      connectionStatus={sim.connectionStatus}
      onReconnect={sim.reconnect}
      header={
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          connectionStatus={sim.connectionStatus}
          onReconnect={sim.reconnect}
        />
      }
    >
      {currentTab === 'overview' ? (
        <div className="flex flex-col gap-4">
          {/* Incident Status & Key Telemetry Counters */}
          <IncidentStatus
            burningCells={sim.burningCells}
            burnedCells={sim.burnedCells}
            healthyCells={sim.healthyCells}
            waterCells={sim.waterCells}
            totalCells={sim.totalCells}
            simulationTime={sim.simulationTime}
            sensors={sim.sensors}
            firstDetectionTime={sim.firstDetectionTime}
          />

          {/* Main 2-Column Ops Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Forest Grid Hero + Simulation & Atmospheric Controls */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <FireGrid
                cells={sim.cells}
                sensors={sim.sensors}
                onCellClick={handleCellClick}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimulationControls
                  status={simStatus}
                  speed={sim.speed}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleResume}
                  onReset={handleReset}
                  onStep={handleStep}
                  onSpeedChange={handleSpeedChange}
                  onSelectScenario={handleSelectScenario}
                />

                <WindControls
                  direction={sim.wind.direction}
                  strength={sim.wind.strength}
                  onDirectionChange={handleWindDirectionChange}
                  onStrengthChange={handleWindStrengthChange}
                />
              </div>
            </div>

            {/* Right Column: Emergency Response Readiness */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <ResponseReadiness
                resources={sim.resources}
                sensors={sim.sensors}
              />
            </div>
          </div>
        </div>
      ) : currentTab === 'os-monitor' ? (
        <OSMonitorView
          processes={sim.processes}
          runningProcessPid={sim.runningProcessPid}
          runningProcessName={sim.runningProcessName}
          schedulerPolicy={sim.schedulerPolicy}
          simulationTime={sim.simulationTime}
          isRunning={sim.isRunning}
          executionHistory={sim.executionHistory}
          resources={sim.resources}
          events={sim.events}
        />
      ) : (
        <PlaceholderView
          tab={currentTab}
          onBackToOverview={() => setCurrentTab('overview')}
        />
      )}
    </DashboardLayout>
  )
}

export default App
