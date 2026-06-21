"""
Tasks cleanup after 3 secs and the process is stopped after 5 seconds.
"""
from celery import shared_task, current_task
from celery import states
from simulationAPI.helpers import ngspice_helper
from celery.exceptions import Ignore
import traceback
from simulationAPI.models import spiceFile
from celery.exceptions import SoftTimeLimitExceeded
from typing import Any, Dict, List, Union



# @shared_task(soft_time_limit=3, time_limit=5)
@shared_task
def process_task(task_id: Union[str, int]) -> Dict[str, Any]:
    try:
        try:

            file_obj: spiceFile = list(spiceFile.objects.filter(task_id=task_id))[0]
            file_path: str = file_obj.file.path
            file_id: Union[str, int] = file_obj.file_id

            print("Processing ", file_path, file_id)

            current_task.update_state(
                state='PROGRESS',
                meta={'current_process': 'Started Processing File'})

            output: Dict[str, Any] = ngspice_helper.ExecNetlist(file_path, file_id)
            current_task.update_state(
                state='PROGRESS',
                meta={'current_process': 'Processed Netlist, Loading Output'})
            return output

        except Exception as e:
            current_task.update_state(state=states.FAILURE, meta={
                'exc_type': type(e).__name__,
                'exc_message': traceback.format_exc().split('\n')})
            print('Exception Occured: ', type(e).__name__)
            raise Ignore()
    except SoftTimeLimitExceeded:
        output: Dict[str, Any] = {'fail': "time limit exceeded"}
        return output

@shared_task
def process_autotune_task(
    task_id: Union[str, int],
    netlist_template: str,
    params_config: List[Dict[str, Any]],
    targets_config: Dict[str, Any],
    max_trials: int,
    analysis_type: str
) -> Dict[str, Any]:
    try:
        from simulationAPI.helpers.autotune_helper import AutotuneStudyCoordinator

        current_task.update_state(
            state='PROGRESS',
            meta={'current_process': 'Initializing Autotune Study...'})

        coordinator: AutotuneStudyCoordinator = AutotuneStudyCoordinator(
            netlist_template=netlist_template,
            params_config=params_config,
            targets_config=targets_config,
            max_trials=max_trials
        )

        def progress_callback(study: Any, trial: Any) -> None:
            current_task.update_state(
                state='PROGRESS',
                meta={
                    'current_process': f'Running trial {trial.number + 1} of {max_trials}',
                    'trial_number': trial.number + 1,
                    'max_trials': max_trials,
                    'best_value': study.best_value,
                    'best_params': study.best_params,
                    'latest_metrics': trial.user_attrs.get("metrics", {}),
                    'latest_parameters': trial.user_attrs.get("parameters", {})
                }
            )

        best_params: Dict[str, float]
        best_value: float
        best_params, best_value = coordinator.run_study(
            file_id=task_id,
            analysis_type=analysis_type,
            callback=progress_callback
        )

        return {
            'status': 'SUCCESS',
            'best_params': best_params,
            'best_value': best_value
        }
    except Exception as e:
        current_task.update_state(state=states.FAILURE, meta={
            'exc_type': type(e).__name__,
            'exc_message': traceback.format_exc().split('\n')})
        raise Ignore()
