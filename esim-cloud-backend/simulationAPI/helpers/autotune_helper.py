import os
import re
import subprocess
import logging
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import numpy as np
from pathlib import Path
from scipy.interpolate import interp1d
import optuna
from django.conf import settings

logger = logging.getLogger(__name__)

def parse_numeric(val: str) -> Union[float, complex]:
    """
    Parses a string representing a numeric value, which could be real or complex.

    Complex numbers are expected in the format (real, imag) or real,imag.

    Args:
        val: The input string to parse.

    Returns:
        The parsed float or complex number, or 0.0 if parsing fails.
    """
    val = val.strip()
    if not val:
        return 0.0
    val = val.strip('()')
    if ',' in val:
        parts: List[str] = val.split(',')
        try:
            imag: str = parts[1].strip() if len(parts) > 1 else "0.0"
            if not imag:
                imag = "0.0"
            return complex(float(parts[0].strip()), float(imag))
        except ValueError:
            return 0.0
    else:
        try:
            return float(val)
        except ValueError:
            return 0.0

def parse_data_file(filepath: str) -> Tuple[List[str], List[float], List[List[Union[float, complex]]]]:
    """
    Parses ngspice data.txt output file.

    Args:
        filepath: Absolute path to the simulation results file.

    Returns:
        A tuple containing:
            - A list of header names (strings).
            - A list of independent variable values (x_data).
            - A list of lists representing dependent variable values (y_data).

    Raises:
        FileNotFoundError: If the data file does not exist at the specified path.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Simulation output file not found: {filepath}")

    headers: List[str] = []
    x_data: List[float] = []
    y_data: List[List[Union[float, complex]]] = []

    with open(filepath, 'r') as f:
        lines: List[str] = f.readlines()

    is_data: bool = False
    reset_on_next_zero: bool = False

    for line in lines:
        # Preprocess: remove parentheses and any whitespace around commas
        cleaned_line: str = line.replace('(', '').replace(')', '')
        cleaned_line = re.sub(r'\s*,\s*', ',', cleaned_line)
        
        parts: List[str] = cleaned_line.split()
        if not parts:
            continue
        
        # Detect header line
        parts_orig: List[str] = line.split()
        if 'Index' in parts_orig:
            new_headers: List[str] = [h.strip() for h in parts_orig[1:]]
            is_data = True
            if new_headers != headers:
                headers = new_headers
                x_data = []
                y_data = [[] for _ in range(len(headers) - 1)]
                reset_on_next_zero = False
            else:
                reset_on_next_zero = True
            continue
        
        # Skip line separator ---
        if '---' in line:
            continue

        if is_data:
            try:
                # First element is Index (integer)
                idx: int = int(parts[0])
                
                # If we saw a header and the index resets to 0, it's a new table/run
                if reset_on_next_zero:
                    if idx == 0:
                        x_data = []
                        y_data = [[] for _ in range(len(headers) - 1)]
                    reset_on_next_zero = False
                
                # Check if we have the expected number of elements
                if len(parts) < 2 + len(y_data):
                    continue
                
                x_val: Union[float, complex] = parse_numeric(parts[1])
                x_float: float = x_val.real if isinstance(x_val, complex) else x_val
                
                y_vals: List[Union[float, complex]] = []
                for i in range(2, 2 + len(y_data)):
                    y_vals.append(parse_numeric(parts[i]))
                
                # Only append to the final lists if everything succeeded
                x_data.append(x_float)
                for i, y_val in enumerate(y_vals):
                    y_data[i].append(y_val)
            except (ValueError, IndexError):
                # End of data or malformed line
                continue

    return headers, x_data, y_data

def evaluate_metrics(
    headers: List[str],
    x_data: List[float],
    y_data: List[List[Union[float, complex]]],
    analysis_type: str
) -> Dict[str, float]:
    """
    Evaluates circuit performance metrics from raw simulation data.

    Args:
        headers: A list of header column names from the simulation.
        x_data: Independent variable values (e.g., time or frequency).
        y_data: Dependent variable values (e.g., voltage or current).
        analysis_type: Type of simulation ('ac' or 'transient').

    Returns:
        A dictionary mapping metric names to their calculated float values.
    """
    metrics: Dict[str, float] = {}
    
    if analysis_type.lower() == 'ac':
        # headers[0] is frequency
        # headers[1] is output node voltage, e.g. v(out)
        if len(y_data) < 1 or len(x_data) < 2:
            return metrics
        
        freqs: np.ndarray = np.array(x_data, dtype=float)
        v_out: np.ndarray = np.array(y_data[0]) # may be complex
        
        # Magnitude in dB
        mag: np.ndarray = np.abs(v_out)
        mag_db: np.ndarray = 20 * np.log10(mag + 1e-20)
        
        # Phase in degrees
        phase: np.ndarray = np.angle(v_out, deg=True)
        # Unwrap phase to avoid jumps
        phase = np.unwrap(phase * np.pi / 180.0) * 180.0 / np.pi
 
        # DC Gain (gain at lowest frequency)
        dc_gain: float = float(mag_db[0])
        metrics['dc_gain'] = dc_gain
 
        # -3 dB Cutoff Frequency
        target_gain: float = dc_gain - 3.0
        # Find frequency where gain drops below target
        try:
            # Sort mag_db and freqs so mag_db is monotonically increasing for interp1d
            sort_idx: np.ndarray = np.argsort(mag_db)
            mag_db_sorted: np.ndarray = mag_db[sort_idx]
            freqs_sorted: np.ndarray = freqs[sort_idx]
            
            # Interpolate to find exact crossover
            f_interp: interp1d = interp1d(mag_db_sorted, freqs_sorted, bounds_error=False, fill_value="extrapolate")
            cutoff_freq: float = float(f_interp(target_gain))
            metrics['cutoff_freq'] = max(0.0, cutoff_freq)
        except Exception:
            metrics['cutoff_freq'] = 0.0
 
        # Phase Margin
        # Unity gain frequency: where mag_db is 0
        try:
            sort_idx = np.argsort(mag_db)
            mag_db_sorted = mag_db[sort_idx]
            freqs_sorted = freqs[sort_idx]
            f_ugb_interp: interp1d = interp1d(mag_db_sorted, freqs_sorted, bounds_error=False, fill_value="extrapolate")
            f_ugb: float = float(f_ugb_interp(0.0))
            
            phase_interp: interp1d = interp1d(freqs, phase, bounds_error=False, fill_value="extrapolate")
            phase_at_ugb: float = float(phase_interp(f_ugb))
            
            # Phase margin is 180 + phase
            pm: float = 180.0 + phase_at_ugb
            # Normalize to [-180, 180]
            pm = (pm + 180) % 360 - 180
            metrics['phase_margin'] = pm
        except Exception:
            metrics['phase_margin'] = 0.0

    elif analysis_type.lower() == 'transient':
        # headers[0] is time
        # headers[1] is output node voltage, e.g. v(out)
        if len(y_data) < 1 or len(x_data) < 2:
            return metrics
        
        times: np.ndarray = np.array(x_data, dtype=float)
        v_out_trans: np.ndarray = np.abs(np.array(y_data[0], dtype=float))
        
        # Slew Rate: max of |dV/dt|
        dt: np.ndarray = np.diff(times)
        dv: np.ndarray = np.diff(v_out_trans)
        
        # Prevent division by zero
        dt = np.where(dt == 0, 1e-20, dt)
        dv_dt: np.ndarray = np.abs(dv / dt)
        
        metrics['slew_rate'] = float(np.max(dv_dt))

    return metrics

def run_single_simulation(netlist_content: str, file_id: Union[str, int]) -> Tuple[Optional[str], Optional[str]]:
    """
    Writes parameterized netlist to disk, runs ngspice, and parses results.

    Args:
        netlist_content: The full SPICE netlist string to simulate.
        file_id: Unique identifier for isolating simulation files.

    Returns:
        A tuple containing:
            - The path to the output data file, or None if the run failed.
            - An error message string, or None if the run was successful.
    """
    sim_dir: str = os.path.join(settings.MEDIA_ROOT, 'autotune', str(file_id))
    Path(sim_dir).mkdir(parents=True, exist_ok=True)
    
    netlist_path: str = os.path.join(sim_dir, 'circuit.cir')
    with open(netlist_path, 'w') as f:
        f.write(netlist_content)
        
    try:
        proc: subprocess.Popen = subprocess.Popen(
            ['ngspice', '-ab', 'circuit.cir'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=sim_dir
        )
        stdout: bytes
        stderr: bytes
        stdout, stderr = proc.communicate()
        
        data_file: str = os.path.join(sim_dir, 'data.txt')
        if not os.path.isfile(data_file):
            return None, "Simulation did not generate output data.txt file."
            
        return data_file, None
    except Exception as e:
        return None, str(e)

def delete_sim_dir(file_id: Union[str, int]) -> None:
    """
    Cleans up and deletes the temporary simulation directory.

    Args:
        file_id: Unique identifier for isolating simulation files.
    """
    sim_dir: str = os.path.join(settings.MEDIA_ROOT, 'autotune', str(file_id))
    if os.path.exists(sim_dir):
        for item in os.listdir(sim_dir):
            try:
                os.remove(os.path.join(sim_dir, item))
            except Exception:
                pass
        try:
            os.rmdir(sim_dir)
        except Exception:
            pass

class EarlyStoppingCallback:
    """
    Callback to stop Optuna optimization early when the loss converges.
    """
    def __init__(self, threshold: float = 1e-5) -> None:
        """
        Initializes the callback with a target loss threshold.

        Args:
            threshold: Stop if study's best value falls below this threshold.
        """
        self.threshold: float = threshold

    def __call__(self, study: optuna.study.Study, trial: optuna.trial.FrozenTrial) -> None:
        """
        Checks the current best loss and triggers early stopping if below threshold.

        Args:
            study: The active Optuna study object.
            trial: The frozen representation of the completed trial.
        """
        # Stop optimization study early if best loss converges below threshold
        if study.best_value < self.threshold:
            study.stop()

class AutotuneStudyCoordinator:
    """
    Coordinates the two-tier global-local parameter autotuning study.
    """
    def __init__(
        self,
        netlist_template: str,
        params_config: List[Dict[str, Any]],
        targets_config: Dict[str, Any],
        max_trials: int = 30
    ) -> None:
        """
        Initializes the coordinator with configuration specs and budgets.

        Args:
            netlist_template: SPICE template with placeholders (e.g., {R1}).
            params_config: Parameters configuration with bounds and search types.
            targets_config: Goal definitions containing targets, weights, and constraints.
            max_trials: Maximum total simulation trials allowed.
        """
        self.netlist_template: str = netlist_template
        self.params_config: List[Dict[str, Any]] = params_config
        self.targets_config: Dict[str, Any] = targets_config
        self.max_trials: int = max_trials
        # Local refinement variables
        self.local_best_params: Dict[str, float] = {}
        self.local_best_loss: float = 1e9
        self.trial_counter: int = 0

    def objective(self, trial: optuna.trial.Trial, file_id: Union[str, int], analysis_type: str) -> float:
        # 1. Propose parameters
        proposed_vals: Dict[str, float] = {}
        netlist_content: str = self.netlist_template
        
        for p in self.params_config:
            name: str = p["name"]
            p_type: str = p.get("type", "Float")
            p_min: float = float(p["min"])
            p_max: float = float(p["max"])
            
            val: Union[int, float]
            if p_type == "Int":
                val = trial.suggest_int(name, int(p_min), int(p_max))
            else:
                # Automate log scale search for wide numeric spans (e.g., > 1 decade) to improve convergence
                if p_min > 0 and (p_max / p_min) >= 10.0:
                    val = trial.suggest_float(name, p_min, p_max, log=True)
                else:
                    val = trial.suggest_float(name, p_min, p_max)
            
            proposed_vals[name] = float(val)
            # Replace placeholder {R1} or {C1} with value
            # Ensure we match {R1} strictly
            placeholder: str = "{" + name + "}"
            # Formatting floats cleanly
            formatted_val: str
            if p_type == "Float":
                formatted_val = f"{val:.6e}"
            else:
                formatted_val = str(val)
            netlist_content = netlist_content.replace(placeholder, formatted_val)

        # 2. Run simulation
        data_file: Optional[str]
        err: Optional[str]
        data_file, err = run_single_simulation(netlist_content, f"{file_id}_{trial.number}")
        if err:
            logger.error(f"Autotune trial {trial.number} simulation failed: {err}")
            delete_sim_dir(f"{file_id}_{trial.number}")
            # Raise TrialPruned so Optuna knows this is an invalid parameter combination
            raise optuna.TrialPruned()
        
        # 3. Parse and evaluate metrics
        try:
            headers: List[str]
            x_data: List[float]
            y_data: List[List[Union[float, complex]]]
            assert data_file is not None
            headers, x_data, y_data = parse_data_file(data_file)
            metrics: Dict[str, float] = evaluate_metrics(headers, x_data, y_data, analysis_type)
        except Exception as e:
            import traceback
            logger.error(f"Autotune trial {trial.number} evaluation failed: {e}\n{traceback.format_exc()}")
            delete_sim_dir(f"{file_id}_{trial.number}")
            raise optuna.TrialPruned()
        finally:
            delete_sim_dir(f"{file_id}_{trial.number}")

        # 4. Calculate Loss (Weighted Sum of Squared Errors)
        loss: float = 0.0
        # Check target specs
        for metric_name, target_info in self.targets_config.items():
            if metric_name == "phase_margin_min":
                # Handle phase margin constraint later
                continue
            
            if metric_name in metrics:
                actual: float = metrics[metric_name]
                target: float = float(target_info["target"])
                weight: float = float(target_info.get("weight", 1.0))
                
                err_val: float
                if metric_name == "cutoff_freq":
                    # Log-scale error for frequency values to ensure symmetric convergence across decades
                    actual_val: float = max(1e-5, actual)
                    target_val: float = max(1e-5, target)
                    err_val = np.log10(actual_val) - np.log10(target_val)
                elif target != 0.0:
                    err_val = (actual - target) / target
                else:
                    err_val = actual - target
                loss += weight * (err_val ** 2)

        # 5. Handle Phase Margin constraint as an inequality constraint (c-TPE)
        # Store constraints in system_attrs
        if "phase_margin_min" in self.targets_config:
            min_pm: float = float(self.targets_config["phase_margin_min"])
            actual_pm: float = metrics.get("phase_margin", 0.0)
            # Optuna constrained optimization requires constraint values <= 0 to be satisfied.
            # We want actual_pm >= min_pm, which is: min_pm - actual_pm <= 0
            constraint_val: float = min_pm - actual_pm
            trial.set_user_attr("constraint", [constraint_val])

        # Save metrics in trial user_attrs for user status query
        trial.set_user_attr("metrics", metrics)
        trial.set_user_attr("parameters", proposed_vals)

        return loss

    def evaluate_loss_for_values(
        self,
        param_values: Dict[str, float],
        trial_num: int,
        file_id: Union[str, int],
        analysis_type: str
    ) -> Tuple[float, Dict[str, float]]:
        """
        Evaluates the loss function for a static dictionary of parameter values.

        Mainly utilized by the local Nelder-Mead simplex search.

        Args:
            param_values: Mapping of parameter name to its numeric value.
            trial_num: The simulation iteration index.
            file_id: Directory/file identifier.
            analysis_type: AC or Transient analysis.

        Returns:
            A tuple containing:
                - The float loss value.
                - The metrics dictionary evaluated during simulation.
        """
        netlist_content: str = self.netlist_template
        for p in self.params_config:
            name: str = p["name"]
            val: float = param_values[name]
            p_type: str = p.get("type", "Float")
            
            placeholder: str = "{" + name + "}"
            formatted_val: str
            if p_type == "Float":
                formatted_val = f"{val:.6e}"
            else:
                formatted_val = str(int(round(val)))
            netlist_content = netlist_content.replace(placeholder, formatted_val)

        data_file: Optional[str]
        err: Optional[str]
        data_file, err = run_single_simulation(netlist_content, f"{file_id}_{trial_num}")
        if err:
            logger.error(f"Autotune trial {trial_num} local simulation failed: {err}")
            return 1e9, {}

        try:
            headers: List[str]
            x_data: List[float]
            y_data: List[List[Union[float, complex]]]
            assert data_file is not None
            headers, x_data, y_data = parse_data_file(data_file)
            metrics: Dict[str, float] = evaluate_metrics(headers, x_data, y_data, analysis_type)
        except Exception as e:
            logger.error(f"Autotune trial {trial_num} local evaluation failed: {e}")
            return 1e9, {}
        finally:
            delete_sim_dir(f"{file_id}_{trial_num}")

        # Calculate Loss
        loss: float = 0.0
        for metric_name, target_info in self.targets_config.items():
            if metric_name == "phase_margin_min":
                continue
            
            if metric_name in metrics:
                actual: float = metrics[metric_name]
                target: float = float(target_info["target"])
                weight: float = float(target_info.get("weight", 1.0))
                
                err_val: float
                if metric_name == "cutoff_freq":
                    actual_val: float = max(1e-5, actual)
                    target_val: float = max(1e-5, target)
                    err_val = np.log10(actual_val) - np.log10(target_val)
                elif target != 0.0:
                    err_val = (actual - target) / target
                else:
                    err_val = actual - target
                loss += weight * (err_val ** 2)

        # Handle constraints as a penalty function for local optimization
        if "phase_margin_min" in self.targets_config:
            min_pm: float = float(self.targets_config["phase_margin_min"])
            actual_pm: float = metrics.get("phase_margin", 0.0)
            if actual_pm < min_pm:
                loss += 10.0 * ((min_pm - actual_pm) ** 2)

        return loss, metrics

    def run_study(
        self,
        file_id: Union[str, int],
        analysis_type: str,
        callback: Optional[Callable[[Any, Any], None]] = None
    ) -> Tuple[Dict[str, float], float]:
        """
        Executes the two-tier global-local hybrid tuning process.

        Runs a global exploration (TPE) study, then uses Nelder-Mead on the
        best candidate parameters for precision local refinement.

        Args:
            file_id: Directory/file identifier.
            analysis_type: AC or Transient analysis.
            callback: Optional user-defined progress callback.

        Returns:
            A tuple containing:
                - The tuned parameters dictionary.
                - The final best loss float achieved.
        """
        # Determine budget split: ~75% for global, remainder for local refinement
        global_trials: int = max(5, int(self.max_trials * 0.75))
        local_trials: int = max(1, self.max_trials - global_trials)

        # We define constraint violation evaluator
        def constraints_evaluator(trial: optuna.trial.FrozenTrial) -> List[float]:
            val_constraint: List[float] = trial.user_attrs.get("constraint", [0.0])
            return val_constraint

        db_dir: str = os.path.join(settings.MEDIA_ROOT, 'autotune')
        Path(db_dir).mkdir(parents=True, exist_ok=True)
        db_path: str = os.path.join(db_dir, f"study_{file_id}.db")
        storage_url: str = f"sqlite:///{db_path}?timeout=30"

        sampler: optuna.samplers.TPESampler = optuna.samplers.TPESampler(constraints_func=constraints_evaluator)
        study: optuna.study.Study = optuna.create_study(
            study_name=f"autotune_{file_id}",
            storage=storage_url,
            direction="minimize",
            sampler=sampler,
            load_if_exists=True
        )

        early_stopping: EarlyStoppingCallback = EarlyStoppingCallback(threshold=1e-5)
        callbacks: List[Any] = [callback, early_stopping] if callback else [early_stopping]
        
        # --- Tier 1: Global Search ---
        study.optimize(
            lambda trial: self.objective(trial, file_id, analysis_type),
            n_trials=global_trials,
            callbacks=callbacks
        )

        best_params: Dict[str, float] = study.best_trial.user_attrs.get("parameters", {}).copy()
        best_value: float = study.best_value

        # If we have reached threshold, stop early
        if best_value < 1e-5 or local_trials <= 0:
            return best_params, best_value

        # --- Tier 2: Local Refinement (Nelder-Mead) ---
        from scipy.optimize import minimize

        class DummyObject:
            def __init__(self, **kwargs: Any) -> None:
                self.__dict__.update(kwargs)

        self.local_best_params = best_params.copy()
        self.local_best_loss = best_value
        self.trial_counter = global_trials

        def local_objective(x: np.ndarray) -> float:
            param_dict: Dict[str, float] = {}
            for idx, p in enumerate(self.params_config):
                name: str = p["name"]
                val: float = float(x[idx])
                # Clip parameter within specified search bounds
                p_min: float = float(p["min"])
                p_max: float = float(p["max"])
                val = np.clip(val, p_min, p_max)
                param_dict[name] = val
            
            self.trial_counter += 1
            loss: float
            metrics: Dict[str, float]
            loss, metrics = self.evaluate_loss_for_values(param_dict, self.trial_counter, file_id, analysis_type)
            
            if loss < self.local_best_loss:
                self.local_best_loss = loss
                self.local_best_params = param_dict.copy()
            
            # Fire standard callback to let Celery task/UI report refinement progress
            if callback:
                mock_trial: DummyObject = DummyObject(
                    number=self.trial_counter - 1,
                    params=param_dict,
                    value=loss,
                    user_attrs={
                        "metrics": metrics,
                        "parameters": param_dict
                    }
                )
                mock_study: DummyObject = DummyObject(
                    best_value=min(loss, best_value),
                    best_params=self.local_best_params
                )
                try:
                    callback(mock_study, mock_trial)
                except Exception:
                    pass

            return loss

        # Initial guess and bounds for SciPy solver
        x0: List[float] = []
        bounds: List[Tuple[float, float]] = []
        for p in self.params_config:
            name: str = p["name"]
            val: float = best_params.get(name, (float(p["min"]) + float(p["max"])) / 2.0)
            x0.append(val)
            bounds.append((float(p["min"]), float(p["max"])))

        x0_arr: np.ndarray = np.array(x0, dtype=float)

        import warnings
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', category=RuntimeWarning, message="Method Nelder-Mead cannot handle.*")
            try:
                minimize(
                    local_objective,
                    x0=x0_arr,
                    method='Nelder-Mead',
                    bounds=bounds,
                    options={'maxiter': local_trials}
                )
            except TypeError:
                # Fallback for SciPy versions where Nelder-Mead bounds param is not supported
                minimize(
                    local_objective,
                    x0=x0_arr,
                    method='Nelder-Mead',
                    options={'maxiter': local_trials}
                )

        return self.local_best_params, self.local_best_loss

