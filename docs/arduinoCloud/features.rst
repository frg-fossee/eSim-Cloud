========
Features
========

The Arduino circuit designer is divided into 2 panes. The left pane consists of the components, while the right pane consists of a workspace on which the components will be dropped and the circuit will be designed. More details are given below.

Component categories
####################
The components are categorized as follows:

+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Categories     | Components                                                                                                                      |
+================+=================================================================================================================================+
| General        | Resistor, Breadboard                                                                                                            |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Controllers    | Arduino UNO                                                                                                                     |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Output         | Buzzer, LED, Motor, LCD, Servo Motor, 7 segment display, RGB LED                                                                | 
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Input          | Push button, Ultrasonic Distance Sensor, PIR Sensor, Slide switch, Photo sensor, Temperature Sensor, Potentiometer, Gas Sensor  |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Sources        | 9v Battery, Coin cell 3v                                                                                                        |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Drivers        | Motor driver L298N                                                                                                              |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+
| Miscellaneous  | Label, Relay module                                                                                                             |
+----------------+---------------------------------------------------------------------------------------------------------------------------------+

Workspace
#########
A workspace is a place where the user can drop the components and design the arduino circuit by connecting the components using wires. 

Component Info / Properties
###########################
The properties for each component can be set by clicking on the component and changing/setting the desired value in the box on the right. For example, one can change the color of LED, set resistence value, etc. To know more information about the component,  one can click the ``View Info`` button.

ERC Check
#########
Basic ERC check is done for simulating a circuit. For example, if the wires are connected or not.

View/Download Component List
############################
The list of components and its quantity which are present on the workspace can be viewed or downloaded in CSV format. This come handy for maintaining a check list or a buying list, when one switches from the web based arduino designer to a physical one.

Export 
######
The circuit can be exported as ``jpeg``, ``png``, and ``svg``. This is useful for documenting and printing.

Code editor
###########
A code editor is a place where the users will write the code (logic) for simulation. This is nothing but ``ino`` file, which can be downloaded for use in Arduino IDE. There is also a facility to include the supported header files like EEPROM, LiquidCrystal, Servo, SoftwareSerial, Wire, and SPI.

Simulator
#########
The Simulation toggle button starts/stops the simulation. The console window displays the logs and output if any for the simulation.

Saving and Re-opening
#####################
The circuits are saved only of an authenticated user and are displayed on the user dashboard. The same can be reopened as well for further editing.

Dashboard
#########
A place where the authenticated user can view the different circuits designed by him/her.

Gallery
#######
A set of example projects (circuit design and code) which can be referred by the users. This is an addon material helpful for the novice users who need to get a feel of the system and the circuit design.
