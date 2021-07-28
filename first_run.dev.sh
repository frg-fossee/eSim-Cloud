#!/bin/bash

#Clear old db files
echo 'Removing old files'
rm -rf mysql_data
rm -rf postgres_data
rm -rf mongo_data

echo 'Deleting Existing Migrations'
find ./esim-cloud-backend -name "migrations" -type d -prune -exec rm -rf '{}' +

#For Slow Systems / Systems with less memory
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120

#Build Containers
echo 'Building Containers, might take a while'
docker-compose -f docker-compose.dev.yml --env-file .env build

# MYSQL does not play well with other containers if not allowed to finish config beforehand
echo 'Waiting for DB to finish its thing....'
docker-compose -f docker-compose.dev.yml --no-recreate --env-file .env -d up db
echo 'Waiting for 1 Minute'
sleep 1m

echo 'Applying Database Migrations'
docker-compose -f docker-compose.dev.yml --env-file .env run --rm django /bin/sh migrations.sh

echo 'Copying Pre-Defined eSim-Gallery'
if [ ! -d esim-cloud-backend/file_storage ]; then
    mkdir esim-cloud-backend/file_storage
fi
cp esim-cloud-backend/workflowAPI/fixtures/circuit_images_esim esim-cloud-backend/file_storage -r
