python manage.py makemigrations
python manage.py makemigrations simulationAPI
python manage.py migrate simulationAPI --database="mongodb"
python manage.py makemigrations libAPI
python manage.py migrate libAPI
python manage.py migrate
