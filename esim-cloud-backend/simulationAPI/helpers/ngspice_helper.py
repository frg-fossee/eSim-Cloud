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


def ExecNetlist(filepath, file_id):
    if not os.path.isfile(filepath):
        raise IOError
    try:

        current_dir = settings.MEDIA_ROOT+'/'+str(file_id)
        # Make Unique Directory for simulation to run
        Path(current_dir).mkdir(parents=True, exist_ok=True)
        os.chdir(current_dir)
        logger.info('will run python command')
        logger.info(filepath)
        proc = subprocess.Popen(['python', filepath],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                cwd=current_dir)
        stdout, stderr = proc.communicate()
        logger.info('Ran python command')
        output = proc.communicate()[0].decode('ascii')
        logger.info(output)

        if proc.returncode not in [0, 1]:
            logger.error('python error encountered')
            logger.error(stderr)
            logger.error(proc.returncode)
            logger.error(stdout)
            target = os.listdir(current_dir)
            for item in target:
                if (item.endswith(".txt")):
                    os.remove(os.path.join('.', item))
            raise CannotRunSpice("ngspice exited with error")
        else:
            logger.info('Ran Python')

        logger.info("Reading Output")
        # output = extract_data_from_ngspice_output(current_dir+'/data.txt')
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
