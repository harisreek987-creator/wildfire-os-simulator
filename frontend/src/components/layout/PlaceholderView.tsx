import React from 'react'
import { Cpu, BarChart3, Radio, Sliders, Server, ArrowLeft, Clock } from 'lucide-react'
import type { NavigationTab } from '../../types/simulation'

interface PlaceholderViewProps {
  tab: NavigationTab
  onBackToOverview: () => void
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ tab, onBackToOverview }) => {
  const getTabDetails = (activeTab: NavigationTab) => {
    switch (activeTab) {
      case 'os-monitor':
        return {
          title: 'OS Monitor & Kernel Telemetry',
          phase: 'Phase 3 / 4 Component',
          icon: <Cpu className="w-8 h-8 text-emerald-400" />,
          description:
            'This view will host the Virtual OS Process Control Block (PCB) Table, Preemptive Priority Scheduler visualization, live OS IPC Event Log stream, and Shared Mutex Resource allocations.',
          features: [
            'Virtual Process State transitions (Ready, Running, Waiting, Completed)',
            'Preemptive Priority Scheduling inspection (Emergency Response preemption)',
            'IPC Event Queue stream with severity filters',
            'Resource allocation lock telemetry',
          ],
        }
      case 'analytics':
        return {
          title: 'Analytics & Detection Benchmark',
          phase: 'Phase 4 / 5 Component',
          icon: <BarChart3 className="w-8 h-8 text-amber-400" />,
          description:
            'This view will house the Early vs. Late Detection comparative experiment, fire propagation time-series charts, and damage mitigation metrics.',
          features: [
            'Configurable Late Detection delay (4s, 6s, 8s, 10s)',
            'Side-by-side run comparisons with deterministic engine seeds',
            'Burned cells progression curves (Recharts)',
            'Resource utilization efficiency reports',
          ],
        }
      case 'sensors':
        return {
          title: 'Sensor Network Array Telemetry',
          phase: 'Phase 4 Component',
          icon: <Radio className="w-8 h-8 text-cyan-400" />,
          description:
            'Dedicated diagnostic telemetry for all distributed sensor nodes (S-01 through S-04), detection latency timestamps, and perimeter radar calibration.',
          features: [
            'Individual node status (Monitoring, Detected, Inactive)',
            'Coordinates and radar radius configuration',
            'Detection delay event logging',
            'Sensor ping latency diagnostics',
          ],
        }
      case 'controls':
        return {
          title: 'Simulation Mission Controls & Scenarios',
          phase: 'Phase 4 Component',
          icon: <Sliders className="w-8 h-8 text-orange-400" />,
          description:
            'Comprehensive simulation configuration deck including wind vector calibration, burn duration parameters, spread probabilities, and scenario presets.',
          features: [
            'Wind vector (Direction & Strength) detailed fine-tuning',
            'Preset scenario launcher (Gale, Rapid Spread, Perimeter Test)',
            'Ignition coordinate dispatch',
            'Simulation speed multiplier controls',
          ],
        }
      case 'system':
        return {
          title: 'System Diagnostics & OS Viva Guide',
          phase: 'Phase 5 Component',
          icon: <Server className="w-8 h-8 text-blue-400" />,
          description:
            'Backend engine health diagnostics, WebSocket frame inspector, architectural documentation, and college OS viva presentation cheat sheet.',
          features: [
            'WebSocket latency and frame inspector',
            'FastAPI endpoint status checks',
            'OS concept viva reference guide (Scheduling, IPC, Mutexes)',
            'System configuration and versioning',
          ],
        }
      default:
        return {
          title: 'Subsystem Module',
          phase: 'Upcoming Phase',
          icon: <Clock className="w-8 h-8 text-slate-400" />,
          description: 'This subsystem is scheduled for redesign in an upcoming phase.',
          features: [],
        }
    }
  }

  const details = getTabDetails(tab)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-6 shadow-xl max-w-2xl mx-auto my-8">
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
        {details.icon}
      </div>

      <div className="space-y-2">
        <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {details.phase}
        </div>
        <h2 className="text-xl font-bold font-mono text-slate-100">{details.title}</h2>
        <p className="text-sm text-slate-400 font-sans max-w-lg mx-auto leading-relaxed">
          {details.description}
        </p>
      </div>

      {details.features.length > 0 && (
        <div className="w-full text-left bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs">
          <div className="text-slate-400 font-bold mb-2 uppercase text-[11px]">
            Planned Subsystem Capabilities:
          </div>
          <ul className="space-y-1.5 text-slate-300">
            {details.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onBackToOverview}
        aria-label="Return to Overview console"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono text-xs font-bold transition shadow-md shadow-emerald-950 border border-emerald-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview Console
      </button>
    </div>
  )
}

