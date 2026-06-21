from celery.exceptions import SoftTimeLimitExceeded
import os
import logging
import subprocess
from pathlib import Path
from django.conf import settings
from .parse import extract_data_from_ngspice_output
from typing import Any, Dict, List, Union

logger = logging.getLogger(__name__)


class CannotRunSpice(Exception):
    """Base class for exceptions in this module."""
    pass


def ExecNetlist(filepath: str, file_id: Union[str, int]) -> Dict[str, Any]:
    if not os.path.isfile(filepath):
        raise IOError
    try:

        current_dir: str = settings.MEDIA_ROOT+'/'+str(file_id)
        # Make Unique Directory for simulation to run
        Path(current_dir).mkdir(parents=True, exist_ok=True)
        os.chdir(current_dir)
        logger.info('will run ngSpice command')
        proc: subprocess.Popen = subprocess.Popen(['ngspice', '-ab', filepath],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                cwd=current_dir)
        stdout: bytes
        stderr: bytes
        stdout, stderr = proc.communicate()
        logger.info('Ran ngSpice command')
        if proc.returncode not in [0, 1]:
            logger.error('ngspice error encountered')
            logger.error(stderr)
            logger.error(proc.returncode)
            logger.error(stdout)
            target: List[str] = os.listdir(current_dir)
            for item in target:
                if (item.endswith(".txt")):
                    os.remove(os.path.join('.', item))
            raise CannotRunSpice("ngspice exited with error")
        else:
            logger.info('Ran ngSpice')

        logger.info("Reading Output")
        output: Dict[str, Any]
        if os.path.isfile(current_dir+'/data.txt'):
            output = extract_data_from_ngspice_output(current_dir+'/data.txt')
            if output["data"]:
                """
                This means output data file exists and has
                data parsed by parse.py
                """
                pass
            else:
                """
                if the output is blank, the err is logged in stderr
                """
                tmp: str = stderr.decode("utf-8")
                foo: str = '{}'.format(tmp)
                output = {'fail': foo}
        else:
            out: str = stdout.decode("utf-8")
            err: str = stderr.decode("utf-8")
            foo = '{}'.format(out+err)
            output = {'fail': foo}
        logger.info('output from ngspice_helper.py')
        logger.info(stderr)
        # logger.info(output)
        logger.info(stdout)
        return output
    except SoftTimeLimitExceeded:
        output = {'fail': "time limit exceeded"}
        print('tle')
        return output
    except Exception as e:
        logger.exception('Encountered Exception:')
        logger.exception(e)
    finally:
        target = os.listdir(current_dir)
        os.remove(filepath)
        for item in target:
            os.remove(os.path.join(current_dir, item))
        os.rmdir(current_dir)
        logger.info('Deleted Files')
