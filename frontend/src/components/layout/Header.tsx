import React, { useState, useRef, useEffect } from 'react'
import {
  Flame,
  Server,
  RefreshCw,
  MoreVertical,
  LayoutDashboard,
  Cpu,
  BarChart3,
  Radio,
  Sliders,
  Settings,
  X,
} from 'lucide-react'
import type { NavigationTab } from '../../types/simulation'
import type { ConnectionStatus } from '../../services/simulationSocket'

interface HeaderProps {
  currentTab: NavigationTab
  onSelectTab: (tab: NavigationTab) => void
  connectionStatus: ConnectionStatus
  onReconnect?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  connectionStatus,
  onReconnect,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const isConnected = connectionStatus === 'CONNECTED'
  const isConnecting = connectionStatus === 'CONNECTING'

  const navItems: { key: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'os-monitor', label: 'OS Monitor', icon: <Cpu className="w-4 h-4" />, badge: 'PCB' },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, badge: 'Charts' },
    { key: 'sensors', label: 'Sensors', icon: <Radio className="w-4 h-4" />, badge: 'Nodes' },
    { key: 'controls', label: 'Controls', icon: <Sliders className="w-4 h-4" /> },
    { key: 'system', label: 'System', icon: <Settings className="w-4 h-4" />, badge: 'Viva' },
  ]

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 text-slate-100 flex items-center justify-between gap-3 shadow-lg sticky top-0 z-50">
      {/* Brand & Active View Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 rounded-lg text-amber-500 flex items-center justify-center shadow-md shadow-amber-950/30">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-100 font-mono">
              Wildfire OS
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
              OPS CONSOLE
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
              {currentTab.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 font-sans hidden md:block">
            Emergency Operations &amp; Virtual Priority Scheduler
          </p>
        </div>
      </div>

      {/* Center Navigation Bar (Desktop) */}
      <nav
        aria-label="Console Views"
        className="hidden xl:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs"
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.key
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer font-bold ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[8px] px-1 py-0.2 rounded ${
                    isActive ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Right Controls: Engine Status & Three-Dot Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs shrink-0">
        {/* Backend Engine Status Badge */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">ENGINE:</span>
          <span
            className={`flex items-center gap-1 sm:gap-1.5 font-bold text-[10px] sm:text-[11px] ${
              isConnected
                ? 'text-emerald-400'
                : isConnecting
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 animate-ping'
                  : isConnecting
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            {connectionStatus}
          </span>
          {!isConnected && onReconnect && (
            <button
              onClick={onReconnect}
              title="Click to reconnect to simulation engine"
              aria-label="Reconnect to backend simulation engine"
              className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-950/80 hover:bg-rose-900 active:bg-rose-950 text-rose-300 border border-rose-800 rounded transition cursor-pointer flex items-center gap-1 font-sans focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 min-h-[26px]"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Retry</span>
            </button>
          )}
        </div>

        {/* Three-Dot Navigation Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Toggle console navigation menu"
            className={`p-2 rounded-lg border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[38px] min-w-[38px] flex items-center justify-center ${
              menuOpen
                ? 'bg-slate-800 text-amber-400 border-amber-500/50'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-slate-100 hover:bg-slate-850'
            }`}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
          </button>

          {/* Dropdown Menu Popover */}
          {menuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 font-mono text-xs flex flex-col gap-1"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-850">
                Console Navigation
              </div>
              {navItems.map((item) => {
                const isActive = currentTab === item.key
                return (
                  <button
                    key={item.key}
                    role="menuitem"
                    onClick={() => {
                      onSelectTab(item.key)
                      setMenuOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 min-h-[40px] rounded-lg text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
