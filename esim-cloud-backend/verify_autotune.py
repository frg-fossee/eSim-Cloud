import os
import sys
from typing import Any, Dict, List, Tuple
import django
import numpy as np

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esimCloud.settings')
django.setup()

from simulationAPI.helpers.autotune_helper import AutotuneStudyCoordinator

def run_ac_test() -> None:
    """
    Executes a validation test for AC analysis autotuning.

    This test runs the autotuning process on an RC Low Pass Filter to tune R1
    so that the cutoff frequency matches 50.0 Hz.
    With C1 = 10uF, the target R1 is approximately 318.31 ohms.
    """
    print("=" * 60)
    print("RUNNING AC ANALYSIS AUTOTUNE VERIFICATION")
    print("=" * 60)
    print("Circuit: RC Low Pass Filter")
    print("Goal: Tune R1 to achieve cutoff_freq = 50.0 Hz")
    print("Formula: fc = 1 / (2 * pi * R1 * C1)")
    print("For C1 = 10uF, target R1 should be approx 318.31 ohms")
    print("-" * 60)

    # Netlist template for AC simulation
    netlist_template: str = """* RC Low Pass Filter Autotune Test
R1 1 2 {R1}
C1 2 0 10u
V1 1 0 ac 1

.control
ac dec 10 1 10k
print v(2) > data.txt
.endc
.end
"""

    params_config: List[Dict[str, Any]] = [
        {"name": "R1", "type": "Float", "min": 100.0, "max": 10000.0}
    ]

    targets_config: Dict[str, Dict[str, float]] = {
        "cutoff_freq": {"target": 50.0, "weight": 1.0}
    }

    coordinator: AutotuneStudyCoordinator = AutotuneStudyCoordinator(
        netlist_template=netlist_template,
        params_config=params_config,
        targets_config=targets_config,
        max_trials=15
    )

    def progress_callback(study: Any, trial: Any) -> None:
        """
        Callback executed after each trial to print intermediate progress.
        """
        metrics: Dict[str, float] = trial.user_attrs.get('metrics', {})
        metrics_str: str = ", ".join(f"{k}: {v:.4f}" for k, v in metrics.items())
        phase: str = "[Global]" if trial.number < 11 else "[Local Refinement]"
        print(f"{phase} Trial {trial.number + 1:2d}: R1 = {trial.params.get('R1', 0.0):8.2f} ohms, "
              f"Loss = {trial.value:10.6f} | Metrics -> {metrics_str}")

    best_params: Dict[str, float]
    best_value: float
    best_params, best_value = coordinator.run_study(
        file_id="cli_ac_test",
        analysis_type="ac",
        callback=progress_callback
    )

    print("-" * 60)
    print("AC OPTIMIZATION COMPLETED!")
    print(f"Best Loss: {best_value:.6f}")
    print(f"Tuned Parameters: {best_params}")
    print(f"Theoretical R1: 318.31 ohms")
    print("=" * 60)

def run_transient_test() -> None:
    """
    Executes a validation test for transient analysis autotuning.

    This test runs the autotuning process on an RC Low Pass Filter to tune R1
    so that the slew rate matches 400.0 V/s.
    With C1 = 10uF, the target R1 is approximately 1250 ohms.
    """
    print("=" * 60)
    print("RUNNING TRANSIENT ANALYSIS AUTOTUNE VERIFICATION")
    print("=" * 60)
    print("Circuit: RC Low Pass Filter")
    print("Goal: Tune R1 to achieve a target Slew Rate of 400.0 V/s")
    print("For a step input of 5V, slew rate is approximately V_step / (R1 * C1)")
    print("For C1 = 10uF, target R1 should be approx 1250 ohms")
    print("-" * 60)

    # Netlist template for Transient simulation
    netlist_template: str = """* RC Low Pass Filter Autotune Test
R1 1 2 {R1}
C1 2 0 10u
V1 1 0 pwl(0 0 1u 5)

.control
tran 1m 50m
print v(2) > data.txt
.endc
.end
"""

    params_config: List[Dict[str, Any]] = [
        {"name": "R1", "type": "Float", "min": 100.0, "max": 10000.0}
    ]

    targets_config: Dict[str, Dict[str, float]] = {
        "slew_rate": {"target": 400.0, "weight": 1.0}
    }

    coordinator: AutotuneStudyCoordinator = AutotuneStudyCoordinator(
        netlist_template=netlist_template,
        params_config=params_config,
        targets_config=targets_config,
        max_trials=15
    )

    def progress_callback(study: Any, trial: Any) -> None:
        """
        Callback executed after each trial to print intermediate progress.
        """
        metrics: Dict[str, float] = trial.user_attrs.get('metrics', {})
        metrics_str: str = ", ".join(f"{k}: {v:.4f}" for k, v in metrics.items())
        phase: str = "[Global]" if trial.number < 11 else "[Local Refinement]"
        print(f"{phase} Trial {trial.number + 1:2d}: R1 = {trial.params.get('R1', 0.0):8.2f} ohms, "
              f"Loss = {trial.value:10.6f} | Metrics -> {metrics_str}")

    best_params: Dict[str, float]
    best_value: float
    best_params, best_value = coordinator.run_study(
        file_id="cli_transient_test",
        analysis_type="transient",
        callback=progress_callback
    )

    print("-" * 60)
    print("TRANSIENT OPTIMIZATION COMPLETED!")
    print(f"Best Loss: {best_value:.6f}")
    print(f"Tuned Parameters: {best_params}")
    print(f"Theoretical R1: ~1250 ohms")
    print("=" * 60)

if __name__ == "__main__":
    mode: str = "menu"
    if len(sys.argv) > 1:
        arg: str = sys.argv[1].lower()
        if arg in ["ac", "trans"]:
            mode = arg

    if mode == "ac":
        run_ac_test()
    elif mode == "trans":
        run_transient_test()
    else:
        print("Please specify analysis type to test:")
        print("  python3 verify_autotune.py ac")
        print("  python3 verify_autotune.py trans")


