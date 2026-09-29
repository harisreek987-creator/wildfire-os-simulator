import type { DetectionComparisonData, DetectionRunResult, ComparisonSummary, ComparisonTimeSeriesPoint } from '../types/simulation'

export interface BackendComparisonResponse {
  config: {
    ignition_row: number
    ignition_col: number
    wind_direction: string
    wind_strength: string
    spread_probability: number
    burn_duration: number
    late_detection_delay: number
    seed: number
    max_steps: number
  }
  early: {
    mode: 'EARLY' | 'LATE'
    detection_time: number | null
    detection_delay: number
    containment_time: number | null
    contained: boolean
    total_burned_cells: number
    peak_burning_cells: number
    fire_spread_percent: string
    firefighters_allocated: number
    water_allocated: number
    drones_allocated: number
    total_steps: number
  }
  late: {
    mode: 'EARLY' | 'LATE'
    detection_time: number | null
    detection_delay: number
    containment_time: number | null
    contained: boolean
    total_burned_cells: number
    peak_burning_cells: number
    fire_spread_percent: string
    firefighters_allocated: number
    water_allocated: number
    drones_allocated: number
    total_steps: number
  }
  summary: {
    burned_cells_difference: number
    containment_time_difference: number | null
    peak_burning_difference: number
    detection_time_difference: number | null
    saved_cells_percent: string
  }
  time_series: Array<{
    step: number
    time: string
    early_burned: number
    early_burning: number
    late_burned: number
    late_burning: number
  }>
}

export interface ComparisonParams {
  ignitionRow?: number
  ignitionCol?: number
  windDirection?: string
  windStrength?: string
  spreadProbability?: number
  burnDuration?: number
  lateDetectionDelay?: number
  seed?: number
  maxSteps?: number
}

function mapBackendToFrontendComparison(res: BackendComparisonResponse): DetectionComparisonData {
  const mapRun = (r: BackendComparisonResponse['early']): DetectionRunResult => ({
    mode: r.mode,
    detectionTime: r.detection_time,
    detectionDelay: r.detection_delay,
    containmentTime: r.containment_time,
    contained: r.contained,
    totalBurnedCells: r.total_burned_cells,
    peakBurningCells: r.peak_burning_cells,
    fireSpreadPercent: r.fire_spread_percent,
    firefightersAllocated: r.firefighters_allocated,
    waterAllocated: r.water_allocated,
    dronesAllocated: r.drones_allocated,
    totalSteps: r.total_steps,
  })

  const summary: ComparisonSummary = {
    burnedCellsDifference: res.summary.burned_cells_difference,
    containmentTimeDifference: res.summary.containment_time_difference,
    peakBurningDifference: res.summary.peak_burning_difference,
    detectionTimeDifference: res.summary.detection_time_difference,
    savedCellsPercent: res.summary.saved_cells_percent,
  }

  const timeSeries: ComparisonTimeSeriesPoint[] = (res.time_series || []).map((pt) => ({
    step: pt.step,
    time: pt.time,
    earlyBurned: pt.early_burned,
    earlyBurning: pt.early_burning,
    lateBurned: pt.late_burned,
    lateBurning: pt.late_burning,
  }))

  return {
    early: mapRun(res.early),
    late: mapRun(res.late),
    summary,
    timeSeries,
  }
}

export async function fetchDetectionComparison(
  params?: ComparisonParams
): Promise<DetectionComparisonData> {
  const envApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
  const baseUrl = envApiBase || `${window.location.protocol}//${window.location.host}`

  const requestPayload: Record<string, unknown> = {}
  if (params?.ignitionRow !== undefined) requestPayload.ignition_row = params.ignitionRow
  if (params?.ignitionCol !== undefined) requestPayload.ignition_col = params.ignitionCol
  if (params?.windDirection) requestPayload.wind_direction = params.windDirection
  if (params?.windStrength) requestPayload.wind_strength = params.windStrength
  if (params?.spreadProbability !== undefined) requestPayload.spread_probability = params.spreadProbability
  if (params?.burnDuration !== undefined) requestPayload.burn_duration = params.burnDuration
  if (params?.lateDetectionDelay !== undefined) requestPayload.late_detection_delay = params.lateDetectionDelay
  if (params?.seed !== undefined) requestPayload.seed = params.seed
  if (params?.maxSteps !== undefined) requestPayload.max_steps = params.maxSteps

  const primaryUrl = `${baseUrl}/simulation/compare-detection`
  const fallbackUrl = 'http://localhost:8000/simulation/compare-detection'

  let response: Response
  try {
    response = await fetch(primaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    })
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
  } catch {
    response = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    })
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
  }

  const json: BackendComparisonResponse = await response.json()
  return mapBackendToFrontendComparison(json)
}
