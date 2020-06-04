=================
Architecture and Installation
=================

The production environment consist of the following docker containers:

+-----------------+------------------------------------------------------------------------------------+
| Container Name  | Description                                                                        |
+=================+====================================================================================+
| nginx           |Used as a reverse proxy to route requests to appropriate endpoints and loadbalancing|
+-----------------+------------------------------------------------------------------------------------+
| celery          |Used as a reverse proxy to route requests to appropriate endpoints and loadbalancing|
+-----------------+------------------------------------------------------------------------------------+
| redis           |Used as a cache and a task queue for Celery                                         |
+-----------------+------------------------------------------------------------------------------------+
| mongodb         |Container running MongoDB Database                                                  |
+-----------------+------------------------------------------------------------------------------------+
| db              |Container running MYSQL Database                                                    |
+-----------------+------------------------------------------------------------------------------------+
| django          |Container running the main Django Backend serving all APIs                          |
+-----------------+------------------------------------------------------------------------------------+
| arduino-frontend|Container running node 10 helping build  Angular app for Arduino Simulation Webapp  |
+-----------------+------------------------------------------------------------------------------------+
| eda-frontend    |Container running node 10 helping build  React app for EDA CircuitSimulation Webapp |
+-----------------+------------------------------------------------------------------------------------+

.. note:: These containers depend on **.env.prod** file, configuration details can be reffered from :doc:`env_variables`.

.. image:: ../images/docker.png
   :width: 600

.. toctree::
    :maxdepth: 2
    :titlesonly:
    :glob:

    installation.rst
    env_variables.rst

