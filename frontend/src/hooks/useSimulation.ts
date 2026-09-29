import { useEffect, useState, useCallback } from 'react'
import {
  simulationSocketService,
  type ConnectionStatus,
  type BackendSimulationState,
} from '../services/simulationSocket'
import type {
  GridCell,
  CellState,
  Sensor,
  WindDirection,
  WindStrength,
  VirtualProcess,
  EventLogEntry,
  ResourceItem,
  OSState,
} from '../types/simulation'
import { generateMockGrid } from '../data/mockData'

export interface UseSimulationReturn {
  cells: GridCell[]
  simulationTime: number
  isRunning: boolean
  speed: number
  wind: { direction: WindDirection; strength: WindStrength }
  sensors: Sensor[]
  firstDetectionTime: number | null
  burningCells: number
  burnedCells: number
  healthyCells: number
  waterCells: number
  totalCells: number
  connectionStatus: ConnectionStatus
  processes: VirtualProcess[]
  events: EventLogEntry[]
  resources: ResourceItem[]
  runningProcessPid: number | null
  runningProcessName: string | null
  schedulerPolicy: string
  osState: OSState | null
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  step: () => void
  setSpeed: (speed: number) => void
  setWind: (direction: WindDirection, strength: WindStrength) => void
  ignite: (row: number, col: number) => void
  reconnect: () => void
}

export const useSimulation = (): UseSimulationReturn => {
  const [cells, setCells] = useState<GridCell[]>(generateMockGrid())
  const [simulationTime, setSimulationTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [speed, setSpeedState] = useState<number>(1)
  const [wind, setWindState] = useState<{ direction: WindDirection; strength: WindStrength }>({
    direction: 'NORTH',
    strength: 'MEDIUM',
  })
  const [sensors, setSensorsState] = useState<Sensor[]>([])
  const [firstDetectionTime, setFirstDetectionTime] = useState<number | null>(null)
  const [burningCells, setBurningCells] = useState<number>(0)
  const [burnedCells, setBurnedCells] = useState<number>(0)
  const [healthyCells, setHealthyCells] = useState<number>(400)
  const [waterCells, setWaterCells] = useState<number>(0)
  const [totalCells, setTotalCells] = useState<number>(400)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED')

  // Live Virtual OS Subsystems State
  const [processes, setProcesses] = useState<VirtualProcess[]>([])
  const [events, setEvents] = useState<EventLogEntry[]>([])
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [runningProcessPid, setRunningProcessPid] = useState<number | null>(null)
  const [runningProcessName, setRunningProcessName] = useState<string | null>(null)
  const [schedulerPolicy, setSchedulerPolicy] = useState<string>('PRIORITY')
  const [osState, setOsState] = useState<OSState | null>(null)

  useEffect(() => {
    simulationSocketService.connect()

    const unsubscribeStatus = simulationSocketService.onStatus((status) => {
      setConnectionStatus(status)
    })

    const unsubscribeState = simulationSocketService.onState((backendState: BackendSimulationState) => {
      setSimulationTime(backendState.simulation_time)
      setIsRunning(backendState.is_running)
      setSpeedState(backendState.speed || 1)
      setBurningCells(backendState.burning_cells)
      setBurnedCells(backendState.burned_cells)
      setHealthyCells(backendState.healthy_cells)
      setWaterCells(backendState.water_cells)
      setTotalCells(backendState.total_cells)
      setFirstDetectionTime(backendState.first_detection_time)

      if (backendState.wind) {
        setWindState({
          direction: backendState.wind.direction,
          strength: backendState.wind.strength,
        })
      }

      if (backendState.sensors && Array.isArray(backendState.sensors)) {
        const mappedSensors: Sensor[] = backendState.sensors.map((s) => ({
          id: s.id,
          name: s.name,
          x: s.col,
          y: s.row,
          radius: s.detection_radius,
          status: s.status,
          lastDetectionTime: s.detected_at !== null ? `${s.detected_at}s` : undefined,
        }))
        setSensorsState(mappedSensors)
      }

      // Map backend 2D matrix (row-major) to GridCell array
      if (backendState.grid && Array.isArray(backendState.grid)) {
        const mappedCells: GridCell[] = []
        const currentSensors = backendState.sensors || []

        for (let r = 0; r < backendState.grid.length; r++) {
          const row = backendState.grid[r]
          for (let c = 0; c < row.length; c++) {
            const rawState = row[c]
            const state: CellState =
              rawState === 'burning'
                ? 'burning'
                : rawState === 'burned'
                ? 'burned'
                : rawState === 'water'
                ? 'water'
                : 'healthy'

            let sensorId: string | undefined
            for (const s of currentSensors) {
              if (s.col === c && s.row === r) {
                sensorId = s.id
                break
              }
            }

            mappedCells.push({
              x: c,
              y: r,
              state,
              sensorId,
            })
          }
        }
        setCells(mappedCells)
      }

      // Map backend OS Virtual Processes
      const rawProcesses = backendState.processes || backendState.os?.processes
      let mappedProcesses: VirtualProcess[] = []
      if (rawProcesses && Array.isArray(rawProcesses)) {
        mappedProcesses = rawProcesses.map((p) => ({
          pid: p.pid,
          name: p.name,
          priority: p.priority,
          priorityLevel: p.priority_level,
          state: p.state,
          cpuUsage: p.cpu_usage,
          description: p.description,
          createdAt: p.created_at,
          lastRunAt: p.last_run_at,
          executionCount: p.execution_count,
          waitingReason: p.waiting_reason,
        }))
        setProcesses(mappedProcesses)
      }

      // Map backend OS IPC Event Queue history
      const rawEvents = backendState.events || backendState.os?.recent_events
      let mappedEvents: EventLogEntry[] = []
      if (rawEvents && Array.isArray(rawEvents)) {
        mappedEvents = rawEvents.map((e) => {
          const formattedTime = `${Math.floor(e.simulation_time / 60)
            .toString()
            .padStart(2, '0')}:${(e.simulation_time % 60).toString().padStart(2, '0')}`

          return {
            id: e.event_id,
            timestamp: formattedTime,
            type: e.event_type,
            message: e.message,
            severity: e.severity,
            source: e.source,
            simulationTime: e.simulation_time,
            payload: e.payload,
          }
        })
        setEvents(mappedEvents)
      }

      // Map backend OS Shared Resources
      const rawResources = backendState.resources || backendState.os?.resources
      let mappedResources: ResourceItem[] = []
      if (rawResources && Array.isArray(rawResources)) {
        mappedResources = rawResources.map((r) => ({
          id: r.id,
          name: r.name,
          total: r.total,
          available: r.available,
          inUse: r.in_use,
          unit: r.unit,
          iconName: r.icon_name,
        }))
        setResources(mappedResources)
      }

      // Extract Scheduler & OS Metadata
      if (backendState.os) {
        setRunningProcessPid(backendState.os.running_process_pid)
        setRunningProcessName(backendState.os.running_process_name)
        setSchedulerPolicy(backendState.os.scheduler_policy || 'PRIORITY')
        setOsState({
          processes: mappedProcesses,
          runningProcessPid: backendState.os.running_process_pid,
          runningProcessName: backendState.os.running_process_name,
          recentEvents: mappedEvents,
          resources: mappedResources,
          schedulerPolicy: backendState.os.scheduler_policy || 'PRIORITY',
        })
      }
    })

    return () => {
      unsubscribeStatus()
      unsubscribeState()
      simulationSocketService.disconnect()
    }
  }, [])

  const start = useCallback(() => {
    simulationSocketService.send({ type: 'start' })
  }, [])

  const pause = useCallback(() => {
    simulationSocketService.send({ type: 'pause' })
  }, [])

  const resume = useCallback(() => {
    simulationSocketService.send({ type: 'resume' })
  }, [])

  const reset = useCallback(() => {
    simulationSocketService.send({ type: 'reset' })
  }, [])

  const step = useCallback(() => {
    simulationSocketService.send({ type: 'step' })
  }, [])

  const setSpeed = useCallback((newSpeed: number) => {
    simulationSocketService.send({ type: 'set_speed', speed: newSpeed })
  }, [])

  const setWind = useCallback((direction: WindDirection, strength: WindStrength) => {
    simulationSocketService.send({ type: 'set_wind', direction, strength })
  }, [])

  const ignite = useCallback((row: number, col: number) => {
    simulationSocketService.send({ type: 'ignite', row, col })
  }, [])

  const reconnect = useCallback(() => {
    simulationSocketService.connect()
  }, [])

  return {
    cells,
    simulationTime,
    isRunning,
    speed,
    wind,
    sensors,
    firstDetectionTime,
    burningCells,
    burnedCells,
    healthyCells,
    waterCells,
    totalCells,
    connectionStatus,
    processes,
    events,
    resources,
    runningProcessPid,
    runningProcessName,
    schedulerPolicy,
    osState,
    start,
    pause,
    resume,
    reset,
    step,
    setSpeed,
    setWind,
    ignite,
    reconnect,
  }
}
