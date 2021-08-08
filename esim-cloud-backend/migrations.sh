python manage.py makemigrations authAPI
python manage.py migrate authAPI
python manage.py makemigrations workflowAPI
python manage.py migrate workflowAPI
python manage.py makemigrations publishAPI
python manage.py migrate publishAPI
python manage.py makemigrations libAPI
python manage.py migrate libAPI
python manage.py makemigrations saveAPI
python manage.py migrate saveAPI
python manage.py makemigrations simulationAPI
python manage.py migrate simulationAPI
python manage.py makemigrations ltiAPI
python manage.py migrate ltiAPI
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py loaddata initial_setup
python manage.py createsuperuser_noinput --username=admin --password=admin
python manage.py load_default_libs --username=admin --location=kicad-symbols/default/ --default
python manage.py load_default_libs --username=admin --location=kicad-symbols/additional/
python manage.py loaddata gallery_setup
