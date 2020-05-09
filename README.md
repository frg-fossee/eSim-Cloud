# EDA
EDA Tool and Arduino on Cloud

[![CodeFactor](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud/badge)](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud)
[![Documentation Status](https://readthedocs.org/projects/esim-cloud/badge/?version=latest)](https://esim-cloud.readthedocs.io/en/latest/?badge=latest)



Development branch status

![Django Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/Django%20Build%20and%20Tests/badge.svg?branch=develop)
![Angular Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/Angular%20Build%20and%20Tests/badge.svg?branch=develop)
![React Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/React%20Build%20and%20Tests/badge.svg?branch=develop)
![Containers](https://github.com/frg-fossee/eSim-Cloud/workflows/Containers/badge.svg)
### Configuring Production Environment
* Install Docker and docker-compose for server OS
* ``` git clone git@github.com:frg-fossee/eSim-Cloud.git && cd eSim-Cloud```
* ``` cp .env .env.prod ```
 **PLEASE CHANGE DEFAULT CREDENTIALS IN THE .env.prod FILE**
* ``` docker-compose -f docker-compose.prod.yml --env-file .env.prod up --scale django=2 --scale celery=3 -d```

### Configuring Development Environment
[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Ffrg-fossee%2FeSim-Cloud&cloudshell_git_branch=develop&cloudshell_print=first_run.dev.sh&cloudshell_tutorial=README.md)
#### Setting up docker containers
* Install docker-ce and docker-compose for your OS

* Build/ReBuild necessary containers using

* To run all containers
``` /bin/bash first_run.dev.sh ``` ( for the first time only )
``` docker-compose -f docker-compose.dev.yml --env-file .env up ```

##### For Setting up Backend containers only

* Run Development environment

 ```docker-compose -f docker-compose.dev.yml --env-file .env up django```

##### For Frontend Containers and backend containers
( Please note these containers are only for dev environment, in production compiled files will be served by nginx)
* To run eda-fronted along with all backend containers

``` docker-compose -f docker-compose.dev.yml --env-file .env up eda-frontend ```

* To run arduino-frontend along with all backend containers

``` docker-compose -f docker-compose.dev.yml --env-file .env up arduino-frontend ```

![Docker Containers](docs/images/docker.png)
