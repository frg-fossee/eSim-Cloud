# Playing songs on Arduino
Submission for screening task 10<br>
By :-<br>
**Deepam Priyadarshi**<br>
deepam.priyadarshi2019@vitstudent.ac.in  
deepam.odhisha@gmail.com (personal)

## Approach
<p>Since due to the inablility of javascript to track event at microseconds level, it is impossible to accurately track the current value at a Buzzer's node/terminal and its rate of change for calculating frequency of the signal.</p>


After looking at the backend code of Arduino's inbuilt `tone()` written by [Brett Hagman (Tone.cpp)](https://github.com/arduino/ArduinoCore-avr/blob/master/cores/arduino/Tone.cpp), I realized that the `tone()` function was making use of CTC mode of the 8-Bit timer2 available on Arduino. The TOP count value for timer2 gets stored in the OCR2A register and the optimal prescaler value is stored in the TCCR2B's clock select bits (last 3 bits). According to the ATmega328P datasheet  

<p align="center">
  <img src="https://user-images.githubusercontent.com/65447610/153737765-b536e15a-0da6-4bf6-aa85-d4f1ac7e983c.png" alt="Formula Description">
</p>

where 
<p align="center">
  <img src="https://user-images.githubusercontent.com/65447610/153737723-75946990-3312-49d5-b76a-be6b85ee8442.png">
 </p>

So, by knowing the last 3 values we can calculate the output frequency that the user wants to hear and initialze it to `AudioContext's Oscillator node frequency` value. Also change the oscillator's waveform type to _square_.  

## Steps taken to solve
1. Added `pinNamedMap` property which maps the pin of Arduino to which the Buzzer is connected.

2. Added `arduino` property to Buzzer class which stores the instance of `ArduinoUno` class to which the Buzzer is connected.  

This will allow access to read the various register values needed for the above calculations.

3.  Added a `setInterval()` callback in `initSimulation()` method which repeatedly checks for updates in the register values and updates the oscillator frequency. The ID returned by `setInterval()` is stored in the `setIntervId` property.

4. Finally we call `clearInterval(setIntervId)` in the `closeSimulation()` method.

## Files Changed

The only file that was modified was __`ArduinoFrontend/src/app/Libs/outputs/Buzzer.ts`__



## Video Demostration

The video given below demonstrates the working of `tone()` functionality with all of it's parameters. The code for the song played was taken from the reference `robsoncouto/arduino-songs` given in the screening task's description.
### Harrpy Potter Theme song
https://github.com/robsoncouto/arduino-songs/blob/master/harrypotter/harrypotter.ino



https://user-images.githubusercontent.com/65447610/153737658-270aa62f-35aa-4fd4-86ff-b2061edd8f0e.mp4


