python manage.py makemigrations
python manage.py makemigrations simulationAPI
python manage.py migrate simulationAPI --database="mongodb"
python manage.py makemigrations libAPI
python manage.py migrate libAPI
python manage.py migrate
rm -r kicad-symbols/symbol_svgs/
python manage.py seed_libs --clear
python manage.py seed_libs --location kicad-symbols/
