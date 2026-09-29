from typing import List, Optional, Dict
from simulation.processes import (
    VirtualProcess,
    ProcessState,
    ProcessPriority,
    PRIORITY_LEVELS,
)


class PriorityScheduler:
    """Preemptive Priority-Based Process Scheduler."""

    def __init__(self):
        self.processes: Dict[int, VirtualProcess] = {}
        self.current_pid: Optional[int] = None
        self.initialize_processes()

    def initialize_processes(self) -> None:
        """Create the 5 required virtual OS processes with their respective priorities."""
        self.processes = {
            104: VirtualProcess(
                pid=104,
                name="Emergency Response",
                priority=ProcessPriority.HIGHEST,
                priority_level=PRIORITY_LEVELS[ProcessPriority.HIGHEST],
                state=ProcessState.WAITING,
                cpu_usage=0,
                description="Resource dispatch & perimeter containment",
            ),
            101: VirtualProcess(
                pid=101,
                name="Fire Spread Engine",
                priority=ProcessPriority.HIGH,
                priority_level=PRIORITY_LEVELS[ProcessPriority.HIGH],
                state=ProcessState.READY,
                cpu_usage=30,
                description="Probabilistic cellular automata step",
            ),
            102: VirtualProcess(
                pid=102,
                name="Sensor Monitor",
                priority=ProcessPriority.MEDIUM,
                priority_level=PRIORITY_LEVELS[ProcessPriority.MEDIUM],
                state=ProcessState.READY,
                cpu_usage=10,
                description="Scanning thermal & infrared sensor grid",
            ),
            103: VirtualProcess(
                pid=103,
                name="Event Handler",
                priority=ProcessPriority.MEDIUM,
                priority_level=PRIORITY_LEVELS[ProcessPriority.MEDIUM],
                state=ProcessState.READY,
                cpu_usage=10,
                description="IPC buffer processing & log dispatch",
            ),
            105: VirtualProcess(
                pid=105,
                name="Statistics Collector",
                priority=ProcessPriority.LOW,
                priority_level=PRIORITY_LEVELS[ProcessPriority.LOW],
                state=ProcessState.READY,
                cpu_usage=5,
                description="Aggregating burn rate & containment metrics",
            ),
        }
        self.current_pid = None

    def get_process_by_name(self, name: str) -> Optional[VirtualProcess]:
        for proc in self.processes.values():
            if proc.name.lower() == name.lower() or proc.name.replace(" ", "_").lower() == name.lower():
                return proc
        return None

    def set_process_state(
        self,
        pid: int,
        state: ProcessState,
        waiting_reason: Optional[str] = None,
    ) -> None:
        """Update lifecycle state of a specific process."""
        if pid in self.processes:
            proc = self.processes[pid]
            proc.state = state
            proc.waiting_reason = waiting_reason

    def select_next_process(self) -> Optional[VirtualProcess]:
        """Select highest-priority READY process with deterministic tie-breaking (lower PID)."""
        ready_procs = [
            p for p in self.processes.values()
            if str(p.state.value if hasattr(p.state, "value") else p.state) == str(ProcessState.READY.value)
        ]

        if not ready_procs:
            return None

        # Sort key: priority_level ascending (1 is highest), then pid ascending
        ready_procs.sort(key=lambda p: (p.priority_level, p.pid))
        return ready_procs[0]

    def schedule_tick(self, simulation_time: int, preferred_pid: Optional[int] = None) -> Optional[VirtualProcess]:
        """Run a scheduling cycle and select the executing process."""
        # Check if preferred process is ready (e.g. triggered event)
        if preferred_pid and preferred_pid in self.processes:
            pref_proc = self.processes[preferred_pid]
            pref_state = str(pref_proc.state.value if hasattr(pref_proc.state, "value") else pref_proc.state)
            if pref_state in [str(ProcessState.READY.value), str(ProcessState.RUNNING.value)]:
                target_proc = pref_proc
            else:
                target_proc = self.select_next_process()
        else:
            target_proc = self.select_next_process()

        # Update running states
        for proc in self.processes.values():
            proc_state = str(proc.state.value if hasattr(proc.state, "value") else proc.state)
            if target_proc and proc.pid == target_proc.pid:
                proc.state = ProcessState.RUNNING
                proc.last_run_at = simulation_time
                proc.execution_count += 1
                proc.waiting_reason = None
            elif proc_state == str(ProcessState.RUNNING.value):
                # Transition previous running process back to READY or WAITING
                proc.state = ProcessState.READY

        self.current_pid = target_proc.pid if target_proc else None
        self._calculate_cpu_loads()
        return target_proc

    def _calculate_cpu_loads(self) -> None:
        """Assign simulated realistic CPU load percentage based on active running process."""
        for proc in self.processes.values():
            proc_state = str(proc.state.value if hasattr(proc.state, "value") else proc.state)
            if proc_state == str(ProcessState.RUNNING.value):
                if proc.priority == ProcessPriority.HIGHEST:
                    proc.cpu_usage = 52
                elif proc.priority == ProcessPriority.HIGH:
                    proc.cpu_usage = 36
                elif proc.priority == ProcessPriority.MEDIUM:
                    proc.cpu_usage = 18
                else:
                    proc.cpu_usage = 8
            elif proc_state == str(ProcessState.READY.value):
                proc.cpu_usage = 5
            else:
                proc.cpu_usage = 0

    def reset(self) -> None:
        """Reset all processes and scheduler state."""
        self.initialize_processes()

    def get_process_list(self) -> List[VirtualProcess]:
        """Return list of all virtual processes sorted by PID."""
        return sorted(self.processes.values(), key=lambda p: p.pid)
