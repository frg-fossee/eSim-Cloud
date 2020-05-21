import os
import shutil
from pathlib import Path
import time
import subprocess
import traceback
from django.conf import settings
from celery import shared_task, current_task
from celery import states
from celery.exceptions import Ignore
import json
import logging

logger = logging.getLogger(__name__)


def saveFiles(data):
    try:
        filenames = []
        if not os.path.exists(settings.MEDIA_ROOT):
            Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
        for k in data:
            work_dir = settings.MEDIA_ROOT+'/'+str(k)

            Path(work_dir).mkdir(parents=True, exist_ok=True)

            filename = settings.MEDIA_ROOT+'/'+str(k)+'/sketch.ino'
            fout = open(filename, 'w', encoding='utf8')
            fout.writelines('#line 1 "{}"\n'.format(filename))
            fout.writelines('void setup();void loop();\n'.format(filename))
            fout.writelines(data.get(k, ''))
            fout.close()

            filenames.append(k)
        return filenames
    except Exception:
        logger.error(traceback.format_exc())
        return []
