export type CellState = 'healthy' | 'burning' | 'burned' | 'water'

export interface GridCell {
  x: number
  y: number
  state: CellState
  sensorId?: string
}

export type WindDirection = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
export type WindStrength = 'LOW' | 'MEDIUM' | 'HIGH'

export type SensorStatus = 'MONITORING' | 'DETECTED' | 'INACTIVE'

export interface Sensor {
  id: string
  name: string
  x: number
  y: number
  radius: number
  status: SensorStatus
  lastDetectionTime?: string | number
}

export type ProcessState = 'READY' | 'RUNNING' | 'WAITING' | 'COMPLETED'
export type ProcessPriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface VirtualProcess {
  pid: number
  name: string
  priority: ProcessPriority
  priorityLevel: number
  state: ProcessState
  cpuUsage: number
  description: string
  createdAt?: number
  lastRunAt?: number | null
  executionCount?: number
  waitingReason?: string | null
}

export type EventSeverity = 'info' | 'warning' | 'alert' | 'success'

export interface EventLogEntry {
  id: string
  timestamp: string
  type:
    | 'IGNITION'
    | 'FIRE_SPREAD'
    | 'SENSOR_SCAN'
    | 'SENSOR_DETECTION'
    | 'ALERT'
    | 'EMERGENCY_RESPONSE'
    | 'RESOURCE_ALLOCATION'
    | 'FIRE_CONTAINED'
  message: string
  severity: EventSeverity
  source?: string
  simulationTime?: number
  payload?: Record<string, unknown>
}

export interface ResourceItem {
  id: string
  name: string
  total: number
  available: number
  inUse: number
  unit: string
  iconName: string
}

export interface OSState {
  processes: VirtualProcess[]
  runningProcessPid: number | null
  runningProcessName: string | null
  recentEvents: EventLogEntry[]
  resources: ResourceItem[]
  schedulerPolicy: string
}

export interface SimulationStats {
  burningCells: number
  burnedCells: number
  healthyCells: number
  waterCells: number
  totalCells: number
  detectionTimeSeconds: number | null
  fireIntensity: string
  activeSensors: number
  totalSensors: number
  elapsedTime: string
  simulationSpeed: number
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
}

export interface DetectionRunResult {
  mode: 'EARLY' | 'LATE'
  detectionTime: number | null
  detectionDelay: number
  containmentTime: number | null
  contained: boolean
  totalBurnedCells: number
  peakBurningCells: number
  fireSpreadPercent: string
  firefightersAllocated: number
  waterAllocated: number
  dronesAllocated: number
  totalSteps: number
}

export interface ComparisonTimeSeriesPoint {
  step: number
  time: string
  earlyBurned: number
  earlyBurning: number
  lateBurned: number
  lateBurning: number
}

export interface ComparisonSummary {
  burnedCellsDifference: number
  containmentTimeDifference: number | null
  peakBurningDifference: number
  detectionTimeDifference: number | null
  savedCellsPercent: string
}

export interface DetectionComparisonData {
  early: DetectionRunResult
  late: DetectionRunResult
  summary: ComparisonSummary
  timeSeries: ComparisonTimeSeriesPoint[]
}
