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
* Configure docker with github packages for pulling pre built images
* echo $GITHUB_TOKEN | docker login docker.pkg.github.com --username [github_username] --password-stdin
* /bin/bash first_run.dev.sh


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
* sh migrations.sh inside a docker container to apply db migrations manually
* To seed libraries - python manage.py seed_libs --location kicad-symbols/ inside container
* To remove seeded libraries - python manage.py seed_libs --clear inside container
