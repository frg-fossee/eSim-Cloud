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

* Configure docker with github packages for pulling pre built images
```echo $GITHUB_TOKEN | docker login docker.pkg.github.com --username [github_username] --password-stdin```
* To build and run migrations ( Pulls latest dev image from github)
``` /bin/bash first_run.dev.sh ``` ( for the first time only )
* To generate libraries and seed them
``` docker-compose -f docker-compose.dev.yml run --rm django python manage.py seed_libs --location kicad-symbols ```
* To Start all containers
``` docker-compose -f docker-compose.dev.yml --env-file .env up ```

* To manually build containers
```docker-compose -f docker-compose.dev.yml --env-file .env build --pull ```

##### For Setting up Backend containers only

* Run Development environment

 ```docker-compose -f docker-compose.dev.yml --env-file .env up django```

##### For Frontend Containers and backend containers
( Please note these containers are only for dev environment, in production compiled files will be served by nginx)
* To run eda-fronted along with all backend containers

``` docker-compose -f docker-compose.dev.yml --env-file .env up eda-frontend ```

* To run arduino-frontend along with all backend containers

``` docker-compose -f docker-compose.dev.yml --env-file .env up arduino-frontend ```

##### Ubuntu Installation Dump
* Note: These are all commands being executed to setup the project's development environment on a fresh ubuntu system with username ``` ubuntu ```

```

   git clone https://github.com/frg-fossee/eSim-Cloud/

   cd eSim-Cloud/

   git checkout develop

   sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   sudo chmod +x /usr/local/bin/docker-compose

   sudo apt-get remove docker docker-engine docker.io containerd runc

   curl -fsSL https://get.docker.com -o get-docker.sh

   sudo sh get-docker.sh

   sudo usermod -aG docker ubuntu

   sudo systemctl start docker

   sudo systemctl status docker

   sudo docker ps

   sudo ./first_run.dev.sh

```

* If you notice ``` ERROR: UnixHTTPConnectionPool(host='localhost', port=None): Read timed out. ``` or ``` Exited with code 137```, it means docker / host system ran out of memory


* Alternatively docker images can be directly pulled from github instead of building on system
```
   echo <GITHUB_TOKEN> | sudo docker login docker.pkg.github.com --username darshkpatel --password-stdin
   sudo docker-compose -f docker-compose.dev.yml pull
   sudo docker-compose -f docker-compose.dev.yml up -d db
   ----WAIT FOR DB TO FINISH INITIALIZING-----
   sudo docker-compose -f docker-compose.dev.yml up
```


![Docker Containers](docs/images/docker.png)
