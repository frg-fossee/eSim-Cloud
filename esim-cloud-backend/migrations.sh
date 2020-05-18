python manage.py makemigrations
python manage.py makemigrations simulationAPI
python manage.py migrate simulationAPI --database="mongodb"
python manage.py makemigrations libAPI
python manage.py migrate libAPI --database="mongodb"
python manage.py migrate
python manage.py seed_libs --location kicad-symbols/
