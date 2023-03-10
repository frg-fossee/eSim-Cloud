from celery.exceptions import SoftTimeLimitExceeded
import os
import logging
import subprocess
from pathlib import Path
from django.conf import settings
from .parse import extract_data_from_ngspice_output
logger = logging.getLogger(__name__)


class CannotRunSpice(Exception):
    """Base class for exceptions in this module."""
    pass


"""
Note: If there is no valid data, the error text is propagated
through output. However, the celery task is passed.
"""


def ExecNetlist(filepath, file_id):
    if not os.path.isfile(filepath):
        raise IOError
    try:

        current_dir = settings.MEDIA_ROOT+'/'+str(file_id)
        # Make Unique Directory for simulation to run
        Path(current_dir).mkdir(parents=True, exist_ok=True)
        os.chdir(current_dir)
        logger.info('will run ngSpice command')
        proc = subprocess.Popen(['ngspice', '-ab', filepath],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                cwd=current_dir)
        stdout, stderr = proc.communicate()
        logger.info('Ran ngSpice command')
        if proc.returncode not in [0, 1]:
            logger.error('ngspice error encountered')
            logger.error(stderr)
            logger.error(proc.returncode)
            logger.error(stdout)
            target = os.listdir(current_dir)
            for item in target:
                if (item.endswith(".txt")):
                    os.remove(os.path.join('.', item))
            raise CannotRunSpice("ngspice exited with error")
        else:
            logger.info('Ran ngSpice')

        logger.info("Reading Output")
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
                tmp = stderr.decode("utf-8")
                foo = '{}'.format(tmp)
                output = {'fail': foo}
        else:
            out = stdout.decode("utf-8")
            err = stderr.decode("utf-8")
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
