import type {
  GridCell,
  Sensor,
  VirtualProcess,
  EventLogEntry,
  ResourceItem,
  SimulationStats,
  DetectionComparisonData,
  WindDirection,
  WindStrength,
} from '../types/simulation'

export const GRID_SIZE = 20

// Generate initial 20x20 mock grid
export const generateMockGrid = (): GridCell[] => {
  const cells: GridCell[] = []

  // Define water body region
  const isWater = (x: number, y: number) => {
    return (x >= 14 && x <= 16 && y >= 4 && y <= 13) || (x === 13 && y >= 7 && y <= 11)
  }

  // Define active burning area
  const isBurning = (x: number, y: number) => {
    return (
      (x === 9 && y === 10) ||
      (x === 10 && y === 10) ||
      (x === 10 && y === 9) ||
      (x === 11 && y === 10) ||
      (x === 10 && y === 11)
    )
  }

  // Define burned area
  const isBurned = (x: number, y: number) => {
    return (
      (x === 8 && y === 9) ||
      (x === 9 && y === 8) ||
      (x === 9 && y === 9) ||
      (x === 8 && y === 8) ||
      (x === 7 && y === 9)
    )
  }

  // Sensors mapping
  const sensorMap: Record<string, { x: number; y: number }> = {
    'S-01': { x: 5, y: 5 },
    'S-02': { x: 10, y: 10 },
    'S-03': { x: 15, y: 15 },
    'S-04': { x: 5, y: 15 },
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let state: GridCell['state'] = 'healthy'
      if (isWater(x, y)) {
        state = 'water'
      } else if (isBurning(x, y)) {
        state = 'burning'
      } else if (isBurned(x, y)) {
        state = 'burned'
      }

      let sensorId: string | undefined
      for (const [id, pos] of Object.entries(sensorMap)) {
        if (pos.x === x && pos.y === y) {
          sensorId = id
          break
        }
      }

      cells.push({ x, y, state, sensorId })
    }
  }

  return cells
}

export const mockSensors: Sensor[] = [
  {
    id: 'S-01',
    name: 'NW Sector Alpha',
    x: 5,
    y: 5,
    radius: 3,
    status: 'MONITORING',
  },
  {
    id: 'S-02',
    name: 'Central Command Post',
    x: 10,
    y: 10,
    radius: 4,
    status: 'DETECTED',
    lastDetectionTime: '00:04:12',
  },
  {
    id: 'S-03',
    name: 'SE Ridge Drone Node',
    x: 15,
    y: 15,
    radius: 3,
    status: 'MONITORING',
  },
  {
    id: 'S-04',
    name: 'SW Valley Optical',
    x: 5,
    y: 15,
    radius: 3,
    status: 'MONITORING',
  },
]

export const mockProcesses: VirtualProcess[] = [
  {
    pid: 101,
    name: 'Emergency Response',
    priority: 'HIGHEST',
    priorityLevel: 1,
    state: 'RUNNING',
    cpuUsage: 48,
    description: 'Resource dispatch & perimeter containment',
  },
  {
    pid: 102,
    name: 'Fire Spread Engine',
    priority: 'HIGH',
    priorityLevel: 2,
    state: 'RUNNING',
    cpuUsage: 32,
    description: 'Probabilistic cellular automata step',
  },
  {
    pid: 103,
    name: 'Sensor Monitor',
    priority: 'MEDIUM',
    priorityLevel: 3,
    state: 'WAITING',
    cpuUsage: 8,
    description: 'Scanning thermal & infrared sensor grid',
  },
  {
    pid: 104,
    name: 'Event Queue Handler',
    priority: 'MEDIUM',
    priorityLevel: 3,
    state: 'READY',
    cpuUsage: 10,
    description: 'IPC buffer processing & log dispatch',
  },
  {
    pid: 105,
    name: 'Statistics Collector',
    priority: 'LOW',
    priorityLevel: 4,
    state: 'READY',
    cpuUsage: 2,
    description: 'Aggregating burn rate & containment metrics',
  },
]

export const mockEventLogs: EventLogEntry[] = [
  {
    id: 'e-01',
    timestamp: '00:01:10',
    type: 'IGNITION',
    message: 'Thermal anomaly detected at cell grid (9, 9)',
    severity: 'warning',
  },
  {
    id: 'e-02',
    timestamp: '00:02:45',
    type: 'FIRE_SPREAD',
    message: 'Fire propagated to neighboring cells (9,10) and (10,9)',
    severity: 'info',
  },
  {
    id: 'e-03',
    timestamp: '00:04:12',
    type: 'SENSOR_DETECTION',
    message: 'Sensor S-02 (Central Command) triggered within 4-cell radius',
    severity: 'alert',
  },
  {
    id: 'e-04',
    timestamp: '00:04:15',
    type: 'ALERT',
    message: 'OS High-Priority Emergency Process (PID 101) spawned',
    severity: 'alert',
  },
  {
    id: 'e-05',
    timestamp: '00:05:00',
    type: 'EMERGENCY_RESPONSE',
    message: 'Preempted low-priority task: Dispatching Aerial Water Bombers',
    severity: 'warning',
  },
  {
    id: 'e-06',
    timestamp: '00:05:30',
    type: 'RESOURCE_ALLOCATION',
    message: 'Allocated 2/4 Drones, 60/100 Water Units, 12/20 Firefighters',
    severity: 'info',
  },
  {
    id: 'e-07',
    timestamp: '00:06:15',
    type: 'FIRE_SPREAD',
    message: 'Wind (NORTH, MEDIUM) accelerating eastward spread probability',
    severity: 'warning',
  },
  {
    id: 'e-08',
    timestamp: '00:07:40',
    type: 'SENSOR_SCAN',
    message: 'Routine grid scan completed: 5 active burning cells identified',
    severity: 'info',
  },
]

export const mockResources: ResourceItem[] = [
  {
    id: 'res-1',
    name: 'Firefighters',
    total: 20,
    available: 8,
    inUse: 12,
    unit: 'Units',
    iconName: 'Users',
  },
  {
    id: 'res-2',
    name: 'Water Supply',
    total: 100,
    available: 40,
    inUse: 60,
    unit: 'kL',
    iconName: 'Droplets',
  },
  {
    id: 'res-3',
    name: 'Surveillance Drones',
    total: 4,
    available: 2,
    inUse: 2,
    unit: 'Units',
    iconName: 'Radio',
  },
]

export const mockStats: SimulationStats = {
  burningCells: 5,
  burnedCells: 5,
  healthyCells: 348,
  waterCells: 42,
  totalCells: 400,
  detectionTimeSeconds: 252, // 4m 12s
  fireIntensity: 'MODERATE',
  activeSensors: 4,
  totalSensors: 4,
  elapsedTime: '00:08:15',
  simulationSpeed: 1,
  status: 'RUNNING',
}

export const mockComparisonData: DetectionComparisonData = {
  early: {
    mode: 'EARLY',
    detectionTime: 0,
    detectionDelay: 0,
    containmentTime: 13,
    contained: true,
    totalBurnedCells: 12,
    peakBurningCells: 4,
    fireSpreadPercent: '3.0%',
    firefightersAllocated: 6,
    waterAllocated: 20,
    dronesAllocated: 2,
    totalSteps: 14,
  },
  late: {
    mode: 'LATE',
    detectionTime: 6,
    detectionDelay: 6,
    containmentTime: 24,
    contained: true,
    totalBurnedCells: 32,
    peakBurningCells: 12,
    fireSpreadPercent: '8.0%',
    firefightersAllocated: 6,
    waterAllocated: 20,
    dronesAllocated: 2,
    totalSteps: 25,
  },
  summary: {
    burnedCellsDifference: 20,
    containmentTimeDifference: 11,
    peakBurningDifference: 8,
    detectionTimeDifference: 6,
    savedCellsPercent: '62.5%',
  },
  timeSeries: [
    { step: 0, time: '00:00', earlyBurned: 0, earlyBurning: 1, lateBurned: 0, lateBurning: 1 },
    { step: 5, time: '00:05', earlyBurned: 3, earlyBurning: 4, lateBurned: 9, lateBurning: 12 },
    { step: 10, time: '00:10', earlyBurned: 8, earlyBurning: 4, lateBurned: 22, lateBurning: 3 },
    { step: 15, time: '00:15', earlyBurned: 12, earlyBurning: 0, lateBurned: 26, lateBurning: 1 },
    { step: 20, time: '00:20', earlyBurned: 12, earlyBurning: 0, lateBurned: 30, lateBurning: 1 },
    { step: 25, time: '00:25', earlyBurned: 12, earlyBurning: 0, lateBurned: 32, lateBurning: 0 },
  ],
}

export const initialWindState = {
  direction: 'NORTH' as WindDirection,
  strength: 'MEDIUM' as WindStrength,
}
