Arduino Frontend Guide
=============================================
************************
Serve on a Local Machine
************************
**Note: Required Node JS and Angular 7**
 
 * For installing nodejs and npm visit ( https://nodejs.org/en/download/)
 
  Open Command prompt (or powershell) and enter the following:
  ::
    	
    npm install -g @angular/cli
	
    ng --version 
 
 

Without Docker
###############

Please Follow the Steps.

1. Open Command promt

2. Navigate to folder **dist/eSim-cloud/ArduinoFrontend/**

3. Execute the following command to start Angular server:
   ::
	
	ng serve
4. For more serve commands visit (https://angular.io/cli/serve)

5. To build the app and deploy your Angular application to a remote server:
   ::
      
        ng build --prod 
	
	


With Docker
###########

Configuring Production Environment
==================================

* Install Docker and docker-compose for server OS
* ``git clone git@github.com:frg-fossee/eSim-Cloud.git && cd eSim-Cloud``
* ``cp .env .env.prod`` **(PLEASE CHANGE DEFAULT CREDENTIALS IN THE .env.prod FILE)**
* ``docker-compose -f docker-compose.prod.yml --env-file .env.prod up --scale django=2 --scale celery=3 -d``

Configuring Development Environment
===================================

Setting up docker containers
----------------------------

* Install docker-ce and docker-compose for your OS
* To Build/ReBuild necessary containers using

  ``docker-compose -f docker-compose.dev.yml build``

For Frontend Containers and backend containers
----------------------------------------------

**( Please note these containers are only for dev environment, in production compiled files will be served by nginx)**

* To run arduino-frontend along with all backend containers
  
  ``docker-compose -f docker-compose.dev.yml up arduino-frontend``
  

Supported Browsers
******************
Our Web Application is supported by the following browsers:

* Google Chrome
* Mozilla Firefox
* Opera
* Microsoft Edge
* Safari



.. toctree::
    :maxdepth: 2
    :titlesonly: 
    :glob:

    components.rst 