export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'

export interface BackendSensor {
  id: string
  name: string
  row: number
  col: number
  detection_radius: number
  status: 'MONITORING' | 'DETECTED' | 'INACTIVE'
  detected_at: number | null
}

export interface BackendWind {
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  strength: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface BackendVirtualProcess {
  pid: number
  name: string
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW'
  priority_level: number
  state: 'READY' | 'RUNNING' | 'WAITING' | 'COMPLETED'
  created_at: number
  last_run_at: number | null
  execution_count: number
  waiting_reason: string | null
  cpu_usage: number
  description: string
}

export interface BackendSimulationEvent {
  event_id: string
  event_type:
    | 'IGNITION'
    | 'FIRE_SPREAD'
    | 'SENSOR_SCAN'
    | 'SENSOR_DETECTION'
    | 'ALERT'
    | 'EMERGENCY_RESPONSE'
    | 'RESOURCE_ALLOCATION'
    | 'FIRE_CONTAINED'
  simulation_time: number
  source: string
  message: string
  severity: 'info' | 'warning' | 'alert' | 'success'
  payload: Record<string, unknown>
}

export interface BackendResourceItem {
  id: string
  name: string
  total: number
  available: number
  in_use: number
  unit: string
  icon_name: string
}

export interface BackendOSState {
  processes: BackendVirtualProcess[]
  running_process_pid: number | null
  running_process_name: string | null
  recent_events: BackendSimulationEvent[]
  resources: BackendResourceItem[]
  scheduler_policy: string
}

export interface BackendSimulationState {
  grid: string[][]
  simulation_time: number
  is_running: boolean
  speed: number
  wind: BackendWind
  sensors: BackendSensor[]
  first_detection_time: number | null
  burning_cells: number
  burned_cells: number
  healthy_cells: number
  water_cells: number
  total_cells: number
  os?: BackendOSState | null
  processes?: BackendVirtualProcess[]
  events?: BackendSimulationEvent[]
  resources?: BackendResourceItem[]
}

type StateCallback = (state: BackendSimulationState) => void
type StatusCallback = (status: ConnectionStatus) => void

export class SimulationSocketService {
  private socket: WebSocket | null = null
  private url: string
  private stateCallbacks: Set<StateCallback> = new Set()
  private statusCallbacks: Set<StatusCallback> = new Set()
  public status: ConnectionStatus = 'DISCONNECTED'
  private reconnectTimer: number | null = null

  constructor() {
    const envWsUrl = import.meta.env.VITE_WS_URL as string | undefined
    if (envWsUrl) {
      this.url = envWsUrl
    } else {
      // Dev fallback: derive from current host so Vite proxy works transparently
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      this.url = `${protocol}//${host}/ws/simulation`
    }
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.setStatus('CONNECTING')

    try {
      this.socket = new WebSocket(this.url)
    } catch {
      this.url = 'ws://localhost:8000/ws/simulation'
      this.socket = new WebSocket(this.url)
    }

    this.socket.onopen = () => {
      this.setStatus('CONNECTED')
      if (this.reconnectTimer) {
        window.clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const data: BackendSimulationState = JSON.parse(event.data)
        this.stateCallbacks.forEach((cb) => cb(data))
      } catch (err) {
        console.error('Failed to parse WebSocket simulation state:', err)
      }
    }

    this.socket.onclose = () => {
      this.setStatus('DISCONNECTED')
      this.scheduleReconnect()
    }

    this.socket.onerror = () => {
      this.setStatus('DISCONNECTED')
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.onclose = null
      this.socket.close()
      this.socket = null
    }

    this.setStatus('DISCONNECTED')
  }

  public send(command: Record<string, unknown>): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command))
    } else {
      console.warn('Cannot send command: WebSocket is not connected.', command)
    }
  }

  public onState(callback: StateCallback): () => void {
    this.stateCallbacks.add(callback)
    return () => this.stateCallbacks.delete(callback)
  }

  public onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback)
    callback(this.status)
    return () => this.statusCallbacks.delete(callback)
  }

  private setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus
    this.statusCallbacks.forEach((cb) => cb(newStatus))
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimer) {
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null
        if (this.status === 'DISCONNECTED') {
          this.connect()
        }
      }, 3000)
    }
  }
}

export const simulationSocketService = new SimulationSocketService()
