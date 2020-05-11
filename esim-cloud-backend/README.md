# eSim-Cloud Backend Documentation



### Configurable Environment Variables for docker container
Environment variables can be found in the .env file, detailed description for each environment variable is provided in readthedocs documentation

### Custom Management Commands:
* ```python manage.py seed_libs --location kicad-symbols``` can be used to convert ```.lib``` files to SVGs and seed their details to the database for libAPI endpoints.
* ```python manage.py seed_libs --clear ``` can be used to delete all existing libraries and components.


### Database Migrations:
* ``` migrations.sh ``` can be used to apply all necessary database migrations automatially
* If manually running the django backend, please ensure to apply migrations to specific databases
* ```python manage.py migrate libAPI --database="mongodb"```
* ```python manage.py migrate simulationAPI --database="mongodb"```
