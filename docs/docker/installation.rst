======================
Installation and Usage
======================

It is essential that `docker <https://docker.com/>`_ and `docker-compose <https://github.com/docker/compose/releases>`_ are installed on a system before following the steps.


Production  Environment
#######################

* git clone git@github.com:frg-fossee/eSim-Cloud.git && cd eSim-Cloud

* cp .env .env.prod

* docker-compose -f docker-compose.prod.yml --env-file .env.prod up --scale django=1 --scale celery=3 -d


.. note:: Please change the default passwords in the **.env.prod** file to secure your instance against attackers.


Development Environment
#######################

* git clone git@github.com:frg-fossee/eSim-Cloud.git && cd eSim-Cloud
* git checkout develop
* docker-compose -f docker-compose.dev.yml build
* docker-compose -f docker-compose.dev.yml run --rm django ./manage.py makemigrations --noinput
* docker-compose -f docker-compose.dev.yml run --rm django ./manage.py migrate --noinput


For running only the backend containers
***************************************


* docker-compose -f docker-compose.dev.yml up django

For running only the eda-frontend container with backend
********************************************************

* docker-compose -f docker-compose.dev.yml up eda-frontend

For running only the arduino-frontend container with backend
************************************************************

* docker-compose -f docker-compose.dev.yml up arduino-frontend


Useful Commands
###############

* docker exec -it <container ID> <command>
* eg. docker exec -it b7e7acf2283e /bin/sh
