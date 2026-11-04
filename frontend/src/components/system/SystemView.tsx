import React, { useState, useEffect } from 'react'
import {
  Server,
  Layers,
  Cpu,
  Wifi,
  RefreshCw,
  Terminal,
  BookOpen,
  ArrowRight,
  Activity,
} from 'lucide-react'
import type { ConnectionStatus } from '../../services/simulationSocket'

interface SystemViewProps {
  connectionStatus: ConnectionStatus
  onReconnect: () => void
}

export const SystemView: React.FC<SystemViewProps> = ({
  connectionStatus,
  onReconnect,
}) => {
  const isConnected = connectionStatus === 'CONNECTED'
  const isConnecting = connectionStatus === 'CONNECTING'
  const [apiStatus, setApiStatus] = useState<'OK' | 'OFFLINE' | 'CHECKING'>('CHECKING')

  useEffect(() => {
    let isMounted = true
    const envApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
    const baseUrl = envApiBase || `${window.location.protocol}//${window.location.host}`

    fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then((res) => {
        if (isMounted) {
          setApiStatus(res.ok ? 'OK' : 'OFFLINE')
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus('OFFLINE')
        }
      })

    return () => {
      isMounted = false
    }
  }, [connectionStatus])

  const handleReconnectAll = () => {
    setApiStatus('CHECKING')
    onReconnect()
    const envApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
    const baseUrl = envApiBase || `${window.location.protocol}//${window.location.host}`
    fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then((res) => setApiStatus(res.ok ? 'OK' : 'OFFLINE'))
      .catch(() => setApiStatus('OFFLINE'))
  }

  const endpoints = [
    {
      method: 'WS',
      path: '/ws/simulation',
      desc: 'Full-duplex real-time state synchronization & command dispatch channel',
      protocol: 'RFC 6455 WebSocket',
    },
    {
      method: 'GET',
      path: '/health',
      desc: 'Engine health check, runtime status, and backend readiness probe',
      protocol: 'HTTP/1.1 REST',
    },
    {
      method: 'POST',
      path: '/simulation/compare-detection',
      desc: 'Headless dual-run deterministic early vs. late detection benchmark engine',
      protocol: 'HTTP/1.1 REST (JSON)',
    },
  ]

  const processes = [
    {
      pid: 104,
      name: 'Emergency Response',
      priority: 'HIGHEST (1)',
      preemption: 'Preemptive interrupt handler',
      role: 'Dispatches emergency units, allocates resource mutex locks upon fire detection.',
    },
    {
      pid: 101,
      name: 'Fire Spread',
      priority: 'HIGH (2)',
      preemption: 'Preemptible by Emergency',
      role: 'Calculates stochastic 20x20 cellular automata transitions using wind vectors.',
    },
    {
      pid: 102,
      name: 'Sensor Monitor',
      priority: 'MEDIUM (3)',
      preemption: 'Cooperative / Preemptible',
      role: 'Executes Euclidean radius checks around IoT sensor nodes (R=3 to 4 cells).',
    },
    {
      pid: 103,
      name: 'Event Handler',
      priority: 'MEDIUM (3)',
      preemption: 'Cooperative / Preemptible',
      role: 'Buffers, serializes, and pushes event notifications to the system log queue.',
    },
    {
      pid: 105,
      name: 'Statistics',
      priority: 'LOW (4)',
      preemption: 'Background lowest tier',
      role: 'Aggregates cell counters, execution telemetry, and performance records.',
    },
  ]

  const vivaQuestions = [
    {
      q: 'Why use Preemptive Priority Scheduling instead of Round-Robin (RR) or FCFS?',
      a: 'In critical safety systems like wildfire management, critical response events (PID 104) cannot afford to wait in a FIFO queue behind non-critical routines like statistics aggregation (PID 105). Preemption allows immediate context switching when an alert interrupt fires, minimizing response delay.',
    },
    {
      q: 'How are resources protected from race conditions and starvation?',
      a: 'Simulated resources (Firefighters, Water tankers, Drones) are managed through counting semaphores and mutex locks. Before Emergency Response can deploy assets, it must acquire the lock. When depleted, requesting tasks transition to the WAITING state until resources are released.',
    },
    {
      q: 'How does the architecture decouple simulation physics from UI rendering?',
      a: 'The Python FastAPI backend executes all discrete-time cellular automata steps and OS scheduling algorithms independently of frontend render cycles. State updates stream over WebSocket at defined intervals, ensuring that frontend lag or frame drops never corrupt simulation determinism.',
    },
    {
      q: 'How does the Early vs. Late Detection experiment demonstrate OS value?',
      a: 'By holding initial seed, terrain, and atmospheric parameters constant, the benchmark quantifies the impact of detection latency. Shorter interrupt delays allow Emergency Response to acquire resources earlier, drastically reducing total burn count and containment time.',
    },
  ]

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                  System Architecture &amp; OS Diagnostics
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  SYSTEM PROFILE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Technical topology, runtime environment specifications, and academic OS viva reference
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`px-2.5 py-1 rounded border font-bold text-[11px] flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : isConnecting
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>WS ENGINE: {connectionStatus}</span>
            </div>

            <div
              className={`px-2.5 py-1 rounded border font-bold text-[11px] flex items-center gap-1.5 ${
                apiStatus === 'OK'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : apiStatus === 'CHECKING'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>REST API: {apiStatus}</span>
            </div>

            <button
              type="button"
              onClick={handleReconnectAll}
              className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Probe / Reconnect
            </button>
          </div>
        </div>

        {/* Stack Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Frontend Tier Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                FRONTEND VISUALIZATION TIER
              </span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                CLIENT LAYER
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Framework:</span>
                <span className="font-bold text-slate-200">React 19 + TypeScript + Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Styling &amp; Design:</span>
                <span className="font-bold text-slate-200">Tailwind CSS v4 + Lucide Icons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telemetry Charts:</span>
                <span className="font-bold text-slate-200">Recharts Responsive Visualizations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State Management:</span>
                <span className="font-bold text-slate-200">Singleton WebSocket Client Hook</span>
              </div>
            </div>
          </div>

          {/* Backend Tier Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                SIMULATION &amp; SCHEDULER ENGINE
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                PYTHON BACKEND
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Engine Core:</span>
                <span className="font-bold text-slate-200">Python 3.10+ / FastAPI Server</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Real-Time Channel:</span>
                <span className="font-bold text-slate-200">Native Async WebSockets (RFC 6455)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cellular Automaton:</span>
                <span className="font-bold text-slate-200">20 × 20 Stochastic Neighbor Model</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Validation:</span>
                <span className="font-bold text-slate-200">Pydantic v2 Schema Modeling</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. API & Network Protocol Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-xs">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Communication Protocol &amp; Endpoints
          </div>
          <span className="text-[11px] text-slate-400">
            Bidirectional WebSocket Stream + Stateless REST Operations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2 px-3 font-semibold">METHOD</th>
                <th className="py-2 px-3 font-semibold">ENDPOINT</th>
                <th className="py-2 px-3 font-semibold">PROTOCOL</th>
                <th className="py-2 px-3 font-semibold">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {endpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        ep.method === 'WS'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{ep.path}</td>
                  <td className="py-2.5 px-3 text-slate-400">{ep.protocol}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Virtual OS Subsystem Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-xs">
            <Cpu className="w-4 h-4 text-amber-400" />
            Operating System Virtual Process Control Table
          </div>
          <span className="text-[11px] text-slate-400">
            5 Logical Simulated Processes Running Under Priority Scheduling
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2 px-3 font-semibold">PID</th>
                <th className="py-2 px-3 font-semibold">PROCESS NAME</th>
                <th className="py-2 px-3 font-semibold">PRIORITY LEVEL</th>
                <th className="py-2 px-3 font-semibold">PREEMPTION RULE</th>
                <th className="py-2 px-3 font-semibold">PRIMARY ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {processes.map((p) => (
                <tr key={p.pid} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 text-slate-400 font-bold">PID {p.pid}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{p.name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.pid === 104
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : p.pid === 101
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : p.pid === 105
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {p.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{p.preemption}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Viva / Academic OS Concept Study Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider text-xs">
            <BookOpen className="w-4 h-4 text-purple-400" />
            OS Viva Presentation Reference &amp; Conceptual Defense
          </div>
          <span className="text-[11px] text-purple-400 font-bold">
            ACADEMIC NOTES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {vivaQuestions.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2"
            >
              <div className="font-bold text-slate-200 text-xs flex items-start gap-1.5 font-sans">
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span>{item.q}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pl-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

