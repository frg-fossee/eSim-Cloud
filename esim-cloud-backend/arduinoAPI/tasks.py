import os
import shutil
from pathlib import Path
import time
import subprocess
import traceback
from django.conf import settings
from celery import shared_task, current_task
from celery import states
import json
import logging
import re

logger = logging.getLogger(__name__)
PATTERN = r'^[ \t]*\w+\d*[ \t]+\w+\d*\(([ \t]*\w+\d*[ \t]+\w+\d*[ \t]*\,?)*\)[ \t]*\n?\{'  # noqa


def saveFiles(data):
    # try:
    filenames = []
    if not os.path.exists(settings.MEDIA_ROOT):
        Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
    for k in data:
        work_dir = settings.MEDIA_ROOT+'/'+str(k)

        Path(work_dir).mkdir(parents=True, exist_ok=True)

        filename = settings.MEDIA_ROOT+'/'+str(k)+'/sketch.ino'

        fout = open(filename, 'w', encoding='utf8')
        matches = re.finditer(PATTERN, data.get(k, ''), re.MULTILINE)

        for _, match in enumerate(matches, start=1):
            func_name = match.group().replace('{', '')
            func_name = func_name.strip() + ';'
            fout.writelines('#line 1 "{}"\n'.format(filename))
            fout.writelines('{}\n'.format(func_name))

        fout.writelines(data.get(k, ''))
        fout.close()

        filenames.append(k)
    return filenames
    # except Exception:
    #     logger.error(traceback.format_exc())
    #     return []


def CompileINO(filenames):
    ret = {}
    try:
        for filename in filenames:
            ino_name = settings.MEDIA_ROOT+'/'+str(filename)+'/sketch.ino'
            out_name = settings.MEDIA_ROOT+'/'+str(filename)+'/out.hex'
            ps = subprocess.Popen(
                ['arduino-cli', 'compile', ino_name, '--fqbn',
                    'arduino:avr:uno', '-o', out_name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            output, err = ps.communicate()
            # print(ps.returncode)
            # print(output)
            # print(err)
            data = ''
            if err == '' and ps.returncode != 0:
                err = b'Code Cannot be Compiled: Unknown Reason'

            if os.path.isfile(out_name):
                data = open(out_name, 'r').read()
            # print(data)

            ret[str(filename)] = {
                'output': re.sub(
                    rf'{settings.MEDIA_ROOT}/\d+/',
                    '',
                    output.decode('utf-8')
                ),
                'error': re.sub(
                    rf'{settings.MEDIA_ROOT}/\d+/',
                    '',
                    err.decode('utf-8')
                ),
                'data': data
            }

    except Exception:
        print(traceback.format_exc())
        return False
    finally:
        for filename in filenames:
            parent = settings.MEDIA_ROOT+'/'+str(filename)
            shutil.rmtree(parent, True)
    return ret


@shared_task
def compile_sketch_task(task_id, data):
    try:
        current_task.update_state(
            state='PROGRESS',
            meta={'current_process': 'Saving Files'})
        filenames = saveFiles(data)
        current_task.update_state(
            state='PROGRESS',
            meta={'current_process': 'Starting Compiling'})
        output = CompileINO(filenames)
        if isinstance(output, bool):
            current_task.update_state(state='FAILURE', meta={
                'exc_type': 'Compilation Error',
                'exc_message': 'Server Error'
            })
            return {'error': True}
        else:
            current_task.update_state(
                state='PROGRESS',
                meta={'current_process': 'Done'})
            return output
    except Exception as e:
        current_task.update_state(state='FAILURE', meta={
            'exc_type': type(e).__name__,
            'exc_message': traceback.format_exc()
        })
        print(traceback.format_exc())
        return {'error': True}
