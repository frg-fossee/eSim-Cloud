=================
Introduction to eSim on Cloud
=================

eSim Development Flow
#####################

Reading Component Symbol Library files and Rendering in the Browser
*******************************************************************
The Kicad symbol libraries '.lib' and '.dcm' (https://github.com/KiCad/kicad-symbols) are parsed to generate SVG files that are compatible with the mxgraph (javascript graph library). This is a one time process. These generated SVG files are read and rendered in the component list (left pane) using mxgraph. 


Generating XML files of the Circuit on Schematic editor
*******************************************************
The components from the left pane are dropped onto the schematic grid. By default, the size of the grid is A4, which can be changed from A5 to A1. The components connected by wires are converted to XML format using mxgraph, whenever the circuit is saved by the user. This XML is used to save and re-open the saved circuits.


Generating Netlist 
******************
Using the mxgraph object, a netlist is generated (compatible with ngspice simulator) when the user clicks on the 'Simulation' or 'generate netlist' button. The simulation parameters are supplied by the user when the user chooses the simulation type.


Scaling ngspice
***************
Using the distributed queueing mechanism of Celery, asynchronous requests (netlist files generated above) are handled which are passed onto ngspice for generating the simulation graph. The simulation graph is rendered using chartjs.


