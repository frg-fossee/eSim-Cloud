=========================
DB Switching Instructions
=========================

* To switch between databases, follow the instructions below
* Please note all data in the database will be lost
* Turn off existing containers ``docker-compose -f docker-compose.dev.yml down``
* Switch to the needed config inside .env then copy it to prod config ``cp .env .env.prod``, make needed changes ( if required) in the prod config
* Uncomment the appropriate DB Block inside docker-compse.(dev/prod).yml, please note only one db block should be present
* Build Containers and run db migrations again ``./first_run.dev.sh``