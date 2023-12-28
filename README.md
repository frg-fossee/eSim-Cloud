<h1 align="center"> 
eSim and Arduino on Cloud 
</h1>
<h6 align="center"> 

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Documentation Status](https://readthedocs.org/projects/esim-cloud/badge/?version=latest)](https://esim-cloud.readthedocs.io/en/latest/?badge=latest)
[![Discord](https://img.shields.io/discord/737767491266281583?color=blue&label=chat%20with%20us&logo=discord)](https://discord.gg/cZbDD8K)

[![CodeFactor](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud/badge)](https://www.codefactor.io/repository/github/frg-fossee/esim-cloud)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-important)](https://img.shields.io/badge/PRs-welcome-important)
![GitHub repo size](https://img.shields.io/github/repo-size/frg-fossee/eSim-Cloud?color=ff69b4&logo=git&logoColor=ff69b4)
![Django Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/Django%20Build%20and%20Tests/badge.svg?branch=develop)
![Angular Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/Angular%20Build%20and%20Tests/badge.svg?branch=develop)
![React Build and Tests](https://github.com/frg-fossee/eSim-Cloud/workflows/React%20Build%20and%20Tests/badge.svg?branch=develop)
![Containers](https://github.com/frg-fossee/eSim-Cloud/workflows/Containers/badge.svg)
![ESLint eda-frontend](https://github.com/frg-fossee/eSim-Cloud/workflows/ESLint%20eda-frontend/badge.svg?branch=develop)

[Contributing](#Contributing) | [Credits](#Credits)
</h6>

---

## eSim on Cloud
This system allows the users to draw analog and digital circuits and simulate them. The users have a facility to drag and drop components from the left pane onto the schematic grid on the right pane. The components on the grid are connected using wires. The circuit can then be simulated using the different simulation parameters (DC Solver, DC Sweep, Transient analysis, and AC analysis). The basic ERC check enables the users to find out errors if any. The size of the schematic grid can be changed from A1 to A5 paper sizes along with portrait and landscape modes. The users can also print the circuit or save it in pdf format for documentation purposes. A demo is shown below.

![eSim Demo](demo/demo-esim.gif)

## Arduino on Cloud
This system allows the users to drag and drop Arduino components from the left pane onto the working space on the right. The pins of the Arduino board can be connected to various input/output devices like LED, motor, push button, etc using wires. There is also a facility to change the color of wires, LEDs, and such components, so as to differentiate the easily. The users can then proceed to write their code in the code window which is then simulated. There is an option for the users to print or save it in pdf format for documentation purposes. The basic ERC check enables the users to find out errors if any. A demo is shown below.

![Arduino Demo](demo/demo-arduino.gif)

## Installation
* This is only a one time process
* Ubuntu (Requirements)
   * Install [Docker](https://docs.docker.com/desktop/install/ubuntu/)
   * Install docker compose: ```sudo apt get install docker-compose``` 
* Windows (Requirements)
   * Install WSL (Windows Subsystem for Linux)
     * Open PowerShell or Windows Command Prompt in administrator mode by right-clicking and selecting "Run as administrator"
     * ```wsl --install```
     * Restart your machine.
   * Install [Docker](https://docs.docker.com/desktop/install/windows-install/)
   * Start the docker desktop application
* Mac (Requirements)
   * Install [Docker](https://docs.docker.com/desktop/install/mac-install/)
   * Start the docker desktop application
* Setting up
   * Fork this repository. Make sure that you fork all the branches.
   * Windows users: Use the Ubuntu App to start the terminal and then proceed ahead. Do not user PowerShell.
   * Clone your forked repo on your machine: ```git clone https://github.com/<yourGitHubUserName>/eSim-Cloud.git```
   * ```cd eSim-Cloud```
   * ```git checkout develop```: This will switch to the develop branch
   * ```/bin/bash first_run.dev.sh```: This will set up and install all the necessary packages and docker images. Depending on your connection it would take around 40 to 45 minutes

## Starting the system
* Before proceeding ahead, start your Docker Desktop application (Windows and Mac users only)
* Open (terminal - Ubuntu/Mac users) (WSL ubuntu app - Windows users)

### Development Environment (for coders/developers)
* ```docker-compose -f docker-compose.dev.yml --env-file .env up ```
* eSim: Browse http://localhost/ and click the Launch button under eSim
* Login credentials
  * Username: admin
  * Password: admin
* Arduino: Browse http://localhost:4200/

### Production Environment
* ```cp .env .env.prod ```: Only for the first time
* ```docker-compose -f docker-compose.prod.yml --env-file .env.prod up```
* Browse http://localhost/ and click the launch button for eSim and Arduino, respectively
* Login credentials
  * Username: admin
  * Password: admin

### Applying Migrations (Only if needed)
* At times, while setting up the system, the database might not get set up as required. In such a case, when you visit the gallery of eSim or Arduino, you will not find the sample circuits. Moreover, in eSim, the components in the left pane will not be loaded. In such a case, do the following
   * Make sure that the dockers are running i.e. you have started either the development or production environment
   * Open up a new terminal.  
   * ```docker ps```  This command displays the container ids of all running docker containers.
   * Look for Django's container ID. It would be something like 'c4ac75dd1937'
   * ```docker exec -it <ContainerID> /bin/bash```
   * ```sh migrations.sh```

## Other Commands
* To view Django admin panel
  * Browse http://localhost/api/admin and login with the following credentials
    * Username: admin
    * Password: admin
* If port 80 is already being used on your system, due which nginx is unable to start for this system and throws an error, you can kill the existing process that uses port 80
   * ```sudo kill -9 $(sudo lsof -t -i:80)``` 
* To start dockers on the server 
   * ``` docker-compose -f docker-compose.prod.yml --env-file .env.prod up --scale django=2 --scale celery=3 -d```
   * Note: -d option runs the dockers in the background. To view the logs in the terminal, remove this option
   * Scale django and celerey as required. Remove them, if the server is unable to take the load
* Restart nginx
  * Development environment: ``` docker-compose -f docker-compose.dev.yml --env-file .env restart nginx```
  * Production environment: ``` docker-compose -f docker-compose.prod.yml --env-file .env.prod restart nginx``` 
* Manually build containers
  * ```docker-compose -f docker-compose.dev.yml --env-file .env build```
* Run backend container only
  * ```docker-compose -f docker-compose.dev.yml --env-file .env up django```
* Run eSim along with backend
  * ``` docker-compose -f docker-compose.dev.yml --env-file .env up eda-frontend ```
* Run Arduino along with backend
  * ``` docker-compose -f docker-compose.dev.yml --env-file .env up arduino-frontend ```

## Documentation 
The latest version of documentation for the project is maintained on [esim-cloud.readthedocs.io](https://esim-cloud.readthedocs.io/)

## Tech stack
* Simulation backend
  * ngspice (eSim)
  * Arduino compiler 
* Middleware
  * Django 
  * REST APIs 
  * Celery 
  * Redis 
* Frontend
  * React
  * mxgraph
  * Angular
  * RaphaelJS
  * [AVR8js simulator - MIT License](https://github.com/wokwi/avr8js) Credits to [Uri Shaked](https://github.com/urish)
* Database
  * MySQL
  * Postgres
  * MongoDB
* Production
  * nginx
  * dockers
* Testing
  * GitHub actions  

## Docker Containers
![Docker Containers](docs/images/docker.png)

## Contributing 
Want to contribute? See our [contributing guidelines](CONTRIBUTING.md). Contributions in any form are welcome.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://darshkpatel.com"><img src="https://avatars.githubusercontent.com/u/11258286?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Darsh Patel</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=darshkpatel" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=darshkpatel" title="Documentation">📖</a> <a href="#infra-darshkpatel" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/darshan-sudake-a640ba1b1/"><img src="https://avatars.githubusercontent.com/u/42094875?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Darshan Sudake</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=dssudake" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=dssudake" title="Documentation">📖</a> <a href="#design-dssudake" title="Design">🎨</a></td>
    <td align="center"><a href="https://felixfaisal.github.io/"><img src="https://avatars.githubusercontent.com/u/42486737?v=4?s=100" width="100px;" alt=""/><br /><sub><b>felixfaisal</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=felixfaisal" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=felixfaisal" title="Documentation">📖</a> <a href="#design-felixfaisal" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/rohitgeddam"><img src="https://avatars.githubusercontent.com/u/48797475?v=4?s=100" width="100px;" alt=""/><br /><sub><b>rohitgeddam</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=rohitgeddam" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=rohitgeddam" title="Documentation">📖</a> <a href="#design-rohitgeddam" title="Design">🎨</a></td>
    <td align="center"><a href="http://navonildas.github.io/"><img src="https://avatars.githubusercontent.com/u/29132316?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Navonil Das</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=NavonilDas" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=NavonilDas" title="Documentation">📖</a> <a href="#design-NavonilDas" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/meet-10"><img src="https://avatars.githubusercontent.com/u/61341284?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Meet10</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=meet-10" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=meet-10" title="Documentation">📖</a> <a href="#design-meet-10" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/gupta-arpit"><img src="https://avatars.githubusercontent.com/u/12170429?v=4?s=100" width="100px;" alt=""/><br /><sub><b>gupta-arpit</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=gupta-arpit" title="Code">💻</a> <a href="#design-gupta-arpit" title="Design">🎨</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://ikartikgautam.web.app/"><img src="https://avatars.githubusercontent.com/u/39825660?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kartik Gautam</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=ikartikgautam" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=ikartikgautam" title="Documentation">📖</a> <a href="#design-ikartikgautam" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/kumanik5661"><img src="https://avatars.githubusercontent.com/u/42597251?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nikhil Kumar</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=kumanik5661" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=kumanik5661" title="Documentation">📖</a> <a href="#design-kumanik5661" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/Kaustuv942"><img src="https://avatars.githubusercontent.com/u/56028031?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kaustuv K Chattopadhyay</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=Kaustuv942" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=Kaustuv942" title="Documentation">📖</a> <a href="#design-Kaustuv942" title="Design">🎨</a></td>
    <td align="center"><a href="https://akshat-sharma.me"><img src="https://avatars.githubusercontent.com/u/35724794?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Akshat Sharma</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=akshat2602" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=akshat2602" title="Documentation">📖</a> <a href="#design-akshat2602" title="Design">🎨</a></td>
    <td align="center"><a href="http://rugvedsomwanshi.me"><img src="https://avatars.githubusercontent.com/u/16833604?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rugved Somwanshi</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=Rugz007" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=Rugz007" title="Documentation">📖</a> <a href="#design-Rugz007" title="Design">🎨</a></td>
    <td align="center"><a href="https://rajatmaheshwari.me/"><img src="https://avatars.githubusercontent.com/u/54249328?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rajat Maheshwari</b></sub></a><br /><a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=rajatmaheshwari2512" title="Code">💻</a> <a href="https://github.com/frg-fossee/eSim-Cloud/commits?author=rajatmaheshwari2512" title="Documentation">📖</a> <a href="#design-rajatmaheshwari2512" title="Design">🎨</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
