import pytest
from simulation.processes import ProcessState, ProcessPriority
from simulation.scheduler import PriorityScheduler


def test_all_five_processes_created():
    """1. All five required virtual processes are created."""
    scheduler = PriorityScheduler()
    procs = scheduler.get_process_list()
    assert len(procs) == 5
    names = [p.name for p in procs]
    assert "Fire Spread Engine" in names
    assert "Sensor Monitor" in names
    assert "Event Handler" in names
    assert "Emergency Response" in names
    assert "Statistics Collector" in names


def test_unique_pids():
    """2. PIDs are unique across all processes."""
    scheduler = PriorityScheduler()
    pids = [p.pid for p in scheduler.get_process_list()]
    assert len(pids) == len(set(pids))


def test_process_priorities():
    """3. Process priorities match OS specification."""
    scheduler = PriorityScheduler()
    er = scheduler.processes[104]
    fs = scheduler.processes[101]
    sm = scheduler.processes[102]
    eh = scheduler.processes[103]
    st = scheduler.processes[105]

    # Priority rank: 1 is highest, 4 is lowest
    assert er.priority_level == 1
    assert fs.priority_level == 2
    assert sm.priority_level == 3
    assert eh.priority_level == 3
    assert st.priority_level == 4

    assert er.priority_level < fs.priority_level < sm.priority_level < st.priority_level


def test_highest_priority_ready_process_selected():
    """5. Scheduler selects the highest-priority READY process."""
    scheduler = PriorityScheduler()
    # Set all processes to READY
    for p in scheduler.processes.values():
        p.state = ProcessState.READY

    selected = scheduler.select_next_process()
    assert selected is not None
    # PID 104 (Emergency Response, level 1) must be selected
    assert selected.pid == 104


def test_equal_priority_deterministic_tie_breaking():
    """6. Equal-priority processes use deterministic tie-breaking (lower PID)."""
    scheduler = PriorityScheduler()
    # Set only PID 102 and PID 103 (both level 3) to READY
    for p in scheduler.processes.values():
        p.state = ProcessState.WAITING

    scheduler.set_process_state(103, ProcessState.READY)
    scheduler.set_process_state(102, ProcessState.READY)

    selected = scheduler.select_next_process()
    assert selected is not None
    assert selected.pid == 102  # Lower PID wins tie-break


def test_process_state_transitions_and_execution_count():
    """7 & 8: Process state transitions and execution count increments."""
    scheduler = PriorityScheduler()
    fs_proc = scheduler.processes[101]
    assert fs_proc.execution_count == 0

    scheduler.schedule_tick(simulation_time=1, preferred_pid=101)
    assert fs_proc.state == ProcessState.RUNNING
    assert fs_proc.execution_count == 1
    assert fs_proc.last_run_at == 1
