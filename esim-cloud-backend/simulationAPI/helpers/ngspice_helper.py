import os
import subprocess
from pathlib import Path
from django.conf import settings
from .parse import extract_data_from_ngspice_output


class CannotAppendPlot(Exception):
    """Base class for exceptions in this module."""
    pass


class CannotRunSpice(Exception):
    """Base class for exceptions in this module."""
    pass


def ExecNetlist(filepath, file_id):
    if not os.path.isfile(filepath):
        raise IOError
    try:

        current_dir = settings.MEDIA_ROOT+'/'+str(file_id)
        print("Workdir: ", current_dir)
        # Make Unique Directory for simulation to run
        Path(current_dir).mkdir(parents=True, exist_ok=True)
        print('will run ngSpice command')
        proc = subprocess.Popen(['ngspice', '-ab', filepath],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                cwd=current_dir)
        stdout, stderr = proc.communicate()
        print('Ran ngSpice command')

        if proc.returncode not in [0, 1]:
            print('ngspice error encountered')
            print(stderr)
            print(proc.returncode)
            print(stdout)
            target = os.listdir(current_dir)
            for item in target:
                if (item.endswith(".txt")):
                    os.remove(os.path.join('.', item))
            raise CannotRunSpice("ngspice exited with error")
        else:
            print('Ran ngSpice')

        print("Reading Output")
        output = extract_data_from_ngspice_output(current_dir+'/data.txt')
        return output
    except Exception as e:
        print('Encountered Exception:')
        print(e)
    finally:
        target = os.listdir(current_dir)
        os.remove(filepath)
        for item in target:
            os.remove(os.path.join(current_dir, item))
        os.rmdir(current_dir)
        print('Deleted Files')
