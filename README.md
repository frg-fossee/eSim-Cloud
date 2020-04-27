# EDA
EDA Tool and Arduino on Cloud

[![CodeFactor](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud/badge)](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud)
![Docker Build Backend](https://github.com/frg-fossee/eSim-Cloud/workflows/Docker%20Build%20Backend/badge.svg?branch=dev-backend)
[![Documentation Status](https://readthedocs.org/projects/esim-cloud/badge/?version=latest)](https://esim-cloud.readthedocs.io/en/latest/?badge=latest)


### Configuring Production Environment
* Install Docker and docker-compose for server OS
* ``` git clone git@github.com:frg-fossee/eSim-Cloud.git && cd eSim-Cloud```
* ``` cp .env .env.prod ```
 **PLEASE CHANGE DEFAULT CREDENTIALS IN THE .env.prod FILE**
* ``` docker-compose -f docker-compose.prod.yml --env-file .env.prod up --scale django=2 --scale celery=3 -d```

### Configuring Development Environment

#### Setting up docker containers
* Install docker-ce and docker-compose for your OS

* To Build/ReBuild necessary containers using

 ```docker-compose -f docker-compose.dev.yml build```


##### For Setting up Backend containers only
* Apply database migrations (only required for first run )

 ```docker-compose -f docker-compose.dev.yml run --rm django ./manage.py migrate --noinput```

* Run Development environment

 ```docker-compose -f docker-compose.dev.yml up django```

##### For Frontend Containers and backend containers
( Please note these containers are only for dev environment, in production compiled files will be served by nginx)
* To run eda-fronted along with all backend containers

``` docker-compose -f docker-compose.dev.yml up eda-frontend ```

* To run arduino-frontend along with all backend containers

``` docker-compose -f docker-compose.dev.yml up arduino-frontend ```

