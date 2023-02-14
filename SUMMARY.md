Summary of the work Done

Two new components have been added: DHT-11 Sensor module and 74LS47 decoder module. The task was to add a new component to the cloud platform.
First I had to understand how the particular modules work. The DHT-11 Sensor module gives us two outputs temperature and humidity. So we need to sliders to get the two inputs. The already written slider class was used to create objects.The 74LS47 decoder IC gets 4 inputs and gives 7 outputs. It converts a BCD number to seven segments.

truth table for the Decoder Ic was drawn and equivalent logic for each output from 'a'to 'g' was found out. This ws implemented in the simulation logic of decoder IC.
Three files were newly added: DHT11.ts, DHT11.json, DHT11.svg, 7447 IC.json, 7447 IC.ts,7447 IC.svg

Video Link (DHT-11):  https://drive.google.com/file/d/1P5NT1KV64GljkeVw5KUDuMWAliLDs_XR/view?usp=sharing
Video LINk(7447 IC): https://drive.google.com/file/d/1g457BNOLSHv8V6qiQ6QVldmIqICP_SOB/view?usp=sharing 
