# EDA
EDA Tool and Arduino on Cloud

[![CodeFactor](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud/badge)](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud)
![Docker Build Backend](https://github.com/frg-fossee/eSim-Cloud/workflows/Docker%20Build%20Backend/badge.svg?branch=dev-backend)
[![Documentation Status](https://readthedocs.org/projects/esim-cloud/badge/?version=latest)](https://esim-cloud.readthedocs.io/en/latest/?badge=latest)


### Configuring Development Environment

#### Setting up docker containers
* Install docker-ce and docker-compose for your OS

* Build necessary containers using ```docker-compose -f docker-compose.dev.yml build```

* Apply database migrations (only required for first run ) ```docker-compose -f docker-compose.dev.yml run --rm django ./manage.py migrate --noinput```

* Run Development environment ```docker-compose -f docker-compose.dev.yml up```

