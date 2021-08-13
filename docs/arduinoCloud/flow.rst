========================
Arduino Development Flow
========================

Drawing Components and Rendering in Browser
###########################################

* Each component is drawn in Inkscape which is exported as ``.png`` and ``.svg``. These files are stored in ``/ArduinoFrontend/src/assets/images/components/``. This is a one time process. 
* The ``png`` files (components) are rendered in the components pane (left pane) in the browser.
* When the components are dropped onto the workspace on the right, the components are rendered using 

  * ``SVG`` if that component does not have any animation, i.e. they remain static during entire the simulation process 
  * ``Raphael``: if that component produces some animation during the simulation. A basic example would be: glowing of LED. 

* The details of these components like ``name``, ``pins``, ``drawing path``, ``voltage``, ``current``, ``frequency``, ``color of LED``, etc., are stored in respective json files ``/ArduinoFrontend/src/assets/jsons/``

Capturing Arduino Project Schematic
###################################

* The components from the left pane are dropped onto the workspace. The components and their connections are stored in JSON format. 

Simulation
##########

* At first, a basic check is done whether the required components are connected or not.
* The code written is then compiled by ``Arduino CLI`` which generates a ``hex code``. 
* This hex code is then passed to ``AVR8js`` which simulates the components in the browser. 


