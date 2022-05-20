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
import uuid

logger = logging.getLogger(__name__)
PATTERN = r'^[ \t]*\w+\d*[ \t]+\w+\d*\(([ \t]*\w+\d*[ \t]+\w+\d*[ \t]*\,?)*\)[ \t]*\n?\{'  # noqa


def saveFiles(data, langIndex):
    # try:
    filenames = []
    if not os.path.exists(settings.MEDIA_ROOT):
        Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
    for k in data:
        foldername = str(uuid.uuid4()) + '_' + str(k)
        work_dir = settings.MEDIA_ROOT+'/'+str(foldername)

        Path(work_dir).mkdir(parents=True, exist_ok=True)

        if langIndex == 0:
            filename = settings.MEDIA_ROOT+'/'+str(foldername)+'/sketch.ino'
        elif langIndex == 1:
            filename = settings.MEDIA_ROOT+'/'+str(foldername)+'/sketch.c'

        fout = open(filename, 'w', encoding='utf8')
        matches = re.finditer(PATTERN, data.get(k, ''), re.MULTILINE)

        for _, match in enumerate(matches, start=1):
            func_name = match.group().replace('{', '')
            func_name = func_name.strip() + ';'
            fout.writelines('#line 1 "{}"\n'.format(filename))
            fout.writelines('{}\n'.format(func_name))

        fout.writelines(data.get(k, ''))
        fout.close()
        filenames.append(foldername)
        logger.info('Creating')
        logger.info(filename)

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
            logger.info('Compiling')
            logger.info(ino_name)

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
            pos = filename.find('_')
            if pos != -1:
                pos += 1
                key = filename[pos:]
            else:
                key = filename

            ret[key] = {
                'output': re.sub(
                    rf'{settings.MEDIA_ROOT}/{filename}/',
                    '',
                    output.decode('utf-8')
                ),
                'error': re.sub(
                    rf'{settings.MEDIA_ROOT}/{filename}/',
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
            logger.info('Removing')
            logger.info(parent)
    return ret


def CompileInlineAssembly(filenames):
    ret = {}
    try:
        for filename in filenames:
            c_name = settings.MEDIA_ROOT+'/'+str(filename)+'/sketch.c'
            obj_name = settings.MEDIA_ROOT+'/'+str(filename)+'/sketch.o'
            bin_name = settings.MEDIA_ROOT+'/'+str(filename)+'/sketch'
            out_name = settings.MEDIA_ROOT+'/'+str(filename)+'/out.hex'
            logger.info('Compiling')
            logger.info(c_name)
            createObj = "avr-gcc -Os -DF_CPU=16000000UL -mmcu=atmega328p -c -o " + obj_name + " " + c_name
            createBin = "avr-gcc -mmcu=atmega328p " + obj_name + " -o " + bin_name
            createHex = "avr-objcopy -O ihex -R .eeprom " + bin_name + " " + out_name
            ps = subprocess.Popen(
                createObj + " && " + createBin + " && " + createHex,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True
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
            pos = filename.find('_')
            if pos != -1:
                pos += 1
                key = filename[pos:]
            else:
                key = filename

            ret[key] = {
                'output': "Compiled Successfully",
                'error': re.sub(
                    rf'{settings.MEDIA_ROOT}/{filename}/',
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
            logger.info('Removing')
            logger.info(parent)
    return ret


@shared_task
def compile_sketch_task(task_id, data, langIndex):
    try:
        current_task.update_state(
            state='PROGRESS',
            meta={'current_process': 'Saving Files'})
        filenames = saveFiles(data, langIndex)
        current_task.update_state(
            state='PROGRESS',
            meta={'current_process': 'Starting Compiling'})
        if langIndex == 0:
            output = CompileINO(filenames)
        elif langIndex == 1:
            output = CompileInlineAssembly(filenames)
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
