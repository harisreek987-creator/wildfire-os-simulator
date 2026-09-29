import React, { useState } from 'react'
import { Header } from './components/layout/Header'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { FireGrid } from './components/simulation/FireGrid'
import { SimulationControls, type ScenarioPreset } from './components/simulation/SimulationControls'
import { WindControls } from './components/simulation/WindControls'
import { SensorPanel } from './components/sensors/SensorPanel'
import { StatisticsPanel } from './components/statistics/StatisticsPanel'
import { ProcessManager } from './components/os/ProcessManager'
import { EventLog } from './components/os/EventLog'
import { ResourcePanel } from './components/os/ResourcePanel'
import { DetectionComparison } from './components/comparison/DetectionComparison'

import { useSimulation } from './hooks/useSimulation'
import type { WindDirection, WindStrength, GridCell, SimulationStats } from './types/simulation'

export const App: React.FC = () => {
  // Connect real WebSocket simulation hook
  const sim = useSimulation()

  const [selectedSensorId, setSelectedSensorId] = useState<string | undefined>('S-02')

  // Real backend statistics derived from simulation hook
  const stats: SimulationStats = {
    burningCells: sim.burningCells,
    burnedCells: sim.burnedCells,
    healthyCells: sim.healthyCells,
    waterCells: sim.waterCells,
    totalCells: sim.totalCells,
    detectionTimeSeconds: sim.firstDetectionTime,
    fireIntensity: sim.burningCells > 15 ? 'HIGH' : sim.burningCells > 5 ? 'MODERATE' : 'LOW',
    activeSensors: sim.sensors.filter((s) => s.status !== 'INACTIVE').length,
    totalSensors: sim.sensors.length || 4,
    elapsedTime: `${sim.simulationTime}s`,
    simulationSpeed: sim.speed,
    status: sim.isRunning ? 'RUNNING' : sim.simulationTime > 0 ? 'PAUSED' : 'IDLE',
  }

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

  const handleSelectSensor = (id: string) => {
    setSelectedSensorId(id)
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
          stats={stats}
          connectionStatus={sim.connectionStatus}
          onReconnect={sim.reconnect}
        />
      }
      stats={
        <StatisticsPanel
          stats={stats}
        />
      }
      fireGrid={
        <FireGrid cells={sim.cells} sensors={sim.sensors} onCellClick={handleCellClick} />
      }
      simulationControls={
        <SimulationControls
          status={stats.status}
          speed={sim.speed}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
          onStep={handleStep}
          onSpeedChange={handleSpeedChange}
          onSelectScenario={handleSelectScenario}
        />
      }
      windControls={
        <WindControls
          direction={sim.wind.direction}
          strength={sim.wind.strength}
          onDirectionChange={handleWindDirectionChange}
          onStrengthChange={handleWindStrengthChange}
        />
      }
      sensors={
        <SensorPanel
          sensors={sim.sensors}
          selectedSensorId={selectedSensorId}
          onSelectSensor={handleSelectSensor}
        />
      }
      processManager={
        <ProcessManager
          processes={sim.processes}
          runningProcessPid={sim.runningProcessPid}
          runningProcessName={sim.runningProcessName}
          schedulerPolicy={sim.schedulerPolicy}
        />
      }
      eventLog={<EventLog logs={sim.events} />}
      resources={<ResourcePanel resources={sim.resources} />}
      comparison={<DetectionComparison />}
    />
  )
}

export default App
