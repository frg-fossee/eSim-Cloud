import { CircuitElement } from '../CircuitElement';
import { ArduinoRunner } from '../AVR8/Execute';
import { isUndefined, isNull } from 'util';
import { Point } from '../Point';
import { EventEmitter } from '@angular/core';
import { GraphDataService } from 'src/app/graph-data.service';
import { AlertService } from '../../alert/alert-service/alert.service';

/**
 * AVR8 global variable
 */
declare var AVR8;

/**
 * Arduino uno component class
 */
export class ArduinoUno extends CircuitElement {
  /**
   * Arduino name Prefix
   */
  static prefix = 'Arduino UNO R3 '; // TODO: fetch from json
  /**
   * Name of the Arduino
   */
  public name: string;
  /**
   * Code inside the arduino
   */
  public code = 'void setup(){\n\t\n}\n\nvoid loop(){\n\t\n}'; // TODO: fetch from json
  /**
   * For execution of code
   */
  public runner: ArduinoRunner;
  /**
   * The Compiled Hex
   */
  public hex: string;
  /**
   * Power LED of Arduino
   */
  public powerLed: any;
  /**
   * Built in LED of arduino
   */
  public builtinLED: any;
  /**
   * Pin Names Mapped to the respective Node
   */
  public pinNameMap: any = {};
  private usedPins: string[] = [];
  /**
   * Servo attached to an arduino
   */
  private servos: any[] = [];
  flag = '00';
  prevPortD = 0;
  prevPortB = 0;
  portFlag = '';
  delayTime = new Date(); // Extra
  /**
   * Constructor for Arduino
   * @param canvas Raphael Paper
   * @param x X position
   * @param y Y Position
   */

  constructor(public canvas: any, x: number, y: number) {
    super('ArduinoUno', x, y, 'Arduino.json', canvas);
    // Logic to Create Name of an  arduino
    let start = window['scope']['ArduinoUno'].length + 1;
    this.name = ArduinoUno.prefix + start;
    while (window['ArduinoUno_name'][this.name]) {
      ++start;
      this.name = ArduinoUno.prefix + start;
    }
    window['ArduinoUno_name'][this.name] = this;
  }
  /**
   * Initialize Arduino
   */
  init() {
    // Create The mapping
    for (const node of this.nodes) {
      this.pinNameMap[node.label] = node;
    }
    // Add a Analog value change Listener to the circuit nodes
    for (let i = 0; i <= 5; ++i) {
      this.pinNameMap[`A${i}`].addValueListener((val) => {
        if (isUndefined(this.runner) || isNull(this.runner)) {
          setTimeout(() => {
            this.runner.adc.setAnalogValue(i, Math.floor(204.6 * val));
          }, 300);
        } else {
          this.runner.adc.setAnalogValue(i, Math.floor(204.6 * val));
        }
      });
    }

    // this.pinNameMap['D12'].addValueListener((v) => {
    //   if (isUndefined(this.runner) || isNull(this.runner)) {
    //     setTimeout(() => {
    //       this.pinNameMap['D12'].setValue(v, this.pinNameMap['D12']);
    //     }, 300);
    //     return;
    //   } else {
    //     if (this.runner.portB.pinState(4) === AVR8.PinState.Input) {
    //       this.runner.portB.setPin(4, v > 0 ? 1 : 0);
    //     }
    //   }
    // });

    // For Port B D5 - D13 add a input listener
    for (let i = 0; i <= 5; ++i) {
      this.pinNameMap[`D${i + 8}`].addValueListener((v) => {
        // console.log([i, v]);
        if (isUndefined(this.runner) || isNull(this.runner)) {
          setTimeout(() => {
            this.pinNameMap[`D${i + 8}`].setValue(1, this.pinNameMap[`D${i + 8}`]);
          }, 300);
          return;
        }
        // Update the value of register only if pin is input
        if (this.runner.portB.pinState(i) === AVR8.PinState.Input) {
          this.runner.portB.setPin(i, v > 0 ? 1 : 0);
        } else if (this.runner.portB.pinState(i) === AVR8.PinState.InputPullUp) {
          // Handle Input PullUp
          this.runner.portB.setPin(i, v);
        }
      });
    }
    // Handle Input For Port D D2 - D7
    for (let i = 2; i <= 7; ++i) {
      this.pinNameMap[`D${i}`].addValueListener((v) => {
        if (isUndefined(this.runner) || isNull(this.runner)) {
          setTimeout(() => {
            this.pinNameMap[`D${i}`].setValue(v, this.pinNameMap[`D${i}`]);
          }, 300);
          return;
        }
        // Update the value of register only if pin is input
        if (this.runner.portD.pinState(i) === AVR8.PinState.Input) {
          this.runner.portD.setPin(i, v > 0 ? 1 : 0);
        } else if (this.runner.portD.pinState(i) === AVR8.PinState.InputPullUp) {
          // Handle Input PullUp
          this.runner.portD.setPin(i, v);
        }
      });
    }
  }
  /**
   * what pins of arduino were used
   */
  trackUsedPins() {
    this.usedPins = [];  // Clear previous entries
    window['scope'].ArduinoUno.forEach(arduino => {
      arduino.nodes.forEach(point => {
        if (point.connectedTo) {
          // console.log("Before mapping - Point Label:", point.label);
          this.usedPins.push(point.label);
        }
      });
    });
    console.log('Used Pins In Circuit:', this.usedPins);
  }
  /**
   * extract pins from code
   */
  extractUsedPins(code: string): string[] {
    // Regex to capture pin assignments like `int led = 13;` or `const int rs = A0;`
    const assignmentRegex = /\b(?:const\s+)?(?:int|byte)\s+(\w+)\s*=\s*(A?\d+);/g;
    // Regex to capture function calls like `pinMode(13, OUTPUT);`, `digitalWrite(led, HIGH);`
    const pinRegex = /\b(?:pinMode|digitalWrite|analogWrite|analogRead|\w+\.attach)\s*\(\s*(\w+)\s*,?/g;
    // Regex to capture the LiquidCrystal constructor
    const liquidCrystalRegex = /LiquidCrystal\s*\w*\s*\(\s*([\dA-Za-z,\s]+)\s*\)/g;
    const pinMap: Record<string, string> = {}; // Store variable assignments
    let match;
    // Extract and store variable assignments
    match = assignmentRegex.exec(code);
    while (match !== null) {
      pinMap[match[1]] = match[2]; // Store { led: "13" }, { rs: "A0" }
      match = assignmentRegex.exec(code);
    }
    const pins: Set<string> = new Set();
    // Extract function call pins and replace variables with their values
    match = pinRegex.exec(code);
    while (match !== null) {
      let pin = match[1]; // Variable or direct number (e.g., "led" or "13")
      if (pin === 'LED_BUILTIN') {
        pin = '13';
      } else if (pinMap[pin]) {
        pin = pinMap[pin]; // Replace with assigned pin number
      }

      if (pin.startsWith('A')) {
        // If it's an analog pin (A0 to A5), add it as is.
        pins.add(pin);
      } else if (!isNaN(Number(pin))) {
        // If it's a number, map it as a digital pin "D{pin}"
        pins.add(`D${pin}`);
      }
      match = pinRegex.exec(code);
    }
    match = liquidCrystalRegex.exec(code);
    while (match !== null) {
      const pinArgs = match[1].trim(); // Get the arguments inside the LiquidCrystal constructor
      // Split the arguments by commas (e.g., "12, 11, 5, 4, 3, 2")
      pinArgs.split(',').forEach(pin => {
        pin = pin.trim(); // Remove any leading or trailing spaces

        // If the pin is a variable, replace it with its assigned value
        if (pinMap[pin]) {
          pin = pinMap[pin]; // Replace with assigned pin number
        }

        // Add the pins to the set with proper formatting
        if (pin.startsWith('A')) {
          // If it's an analog pin, add it as is.
          pins.add(pin);
        } else if (!isNaN(Number(pin))) {
          // If it's a numeric pin, treat it as a digital pin.
          pins.add(`D${pin}`);
        }
      });
      match = liquidCrystalRegex.exec(code);
    }
    const pinsArray: string[] = [];
    pins.forEach((pin) => {
        pinsArray.push(pin);  // Push each value to the array
    });
    console.log('Extracted Pins From Code:', pinsArray);
    return pinsArray;
  }
  /**
   * Method to check if there are any mismatched pins between used and declared pins
   */
  checkPinMismatches() {
    const usedPinsFromCode = this.extractUsedPins(this.code);
    const connectedPins = this.usedPins.filter(pin => pin !== 'GND' && pin !== '5V' && pin !== '3.3V');  // Exclude GND, 5V, and 3.3V

    const codeMismatchedPins = usedPinsFromCode.filter(pin => !connectedPins.includes(pin));
    const cricuitMismatchedPins = connectedPins.filter(pin => !usedPinsFromCode.includes(pin));
    if (codeMismatchedPins.length > 0) {
      // console.error('The following pins are declared in the code but not connected in the simulation:', mismatchedPins);
      const errorMessage = `The following pins are declared in the code but NOT CONNECTED in the CIRCUIT: ${codeMismatchedPins.join(', ')}`;
      AlertService.showAlert(errorMessage);
    } else if (cricuitMismatchedPins.length > 0) {
      // console.error('The following pins are connected in the circuit but not declared in the code:', cricuitMismatchedPins);
      const errMessage = `The following pins are connected in the circuit but NOT DECLARED in the CODE: ` +
                   `${cricuitMismatchedPins.join(', ')}`;
      AlertService.showAlert(errMessage);
    } else {
      console.log('All pins in the code are correctly connected.');
    }
  }
  /**
   * Data which needs to be saved inside the database
   */
  SaveData() {
    return {
      name: this.name,
      code: this.code
    };
  }
  /**
   * Load Data which is fetched from data base
   * @param data Data fetched from the database
   */
  LoadData(data: any) {
    this.name = data.data.name;
    this.code = data.data.code;
  }
  /**
   * Property of an Arduino
   */
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    const label = document.createElement('label');
    label.innerText = 'Name';
    const inp = document.createElement('input');
    inp.value = this.name;
    body.appendChild(label);
    body.appendChild(inp);
    inp.onkeyup = (ev: KeyboardEvent) => {
      if (ev.key.length > 1) {
        return;
      }
      if (window['ArduinoUno_name'][inp.value]) {
        // TODO: SHow Toast
        console.log('Name already Exist');
        return;
      }
      delete window['ArduinoUno_name'][this.name];
      this.name = inp.value;
      window['ArduinoUno_name'][this.name] = this;
    };
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Arduino Uno',
      body
    };
  }
  /**
   * Delete arduino name
   */
  delete() {
    delete window['ArduinoUno_name'][this.name];
  }

  /**
   * Initialize Stuff for simulation.
   */
  initSimulation(): void {
    this.builtinLED = this.elements[1].glow({
      color: '#ffff00'
    });
    this.builtinLED.hide();
    this.powerLed = this.elements[2].glow({
      color: '#00ff00'
    });
    const myOutput = document.createElement('pre');
    if (isNull(this.hex) && isUndefined(this.hex)) {
      return;
    }
    this.runner = new ArduinoRunner(this.hex);

    this.runner.portB.addListener((value) => {
      if (this.portFlag !== 'D' &&
        (this.flag === '21' || this.flag === '41')
      ) {
        this.EmitValueChangeEvent(); // Reset flag = "00";
        this.portFlag = 'B';
      } else {
        this.portFlag = '';
      }
      // if (this.flag === '00') this.flag = '21';
      this.flag = '21';
      this.prevPortB = value;
      this.delayTime = new Date();

      for (let i = 0; i <= 5; ++i) {
        if (
          this.runner.portB.pinState(i) !== AVR8.PinState.Input &&
          this.runner.portB.pinState(i) !== AVR8.PinState.InputPullUp
        ) {
          this.pinNameMap[`D${i + 8}`].setValue(((value >> i) & 1) * 5.0, null);
        }
      }
      if ((value >> 5) & 1) {
        this.builtinLED.show();
      } else {
        this.builtinLED.hide();
      }
    });
    this.runner.portC.addListener((value) => {
      console.log(value);
    });

    this.runner.portD.addListener((value) => {
      if (this.portFlag !== 'B' &&
        (this.flag === '21' || this.flag === '41')
      ) {
        this.EmitValueChangeEvent(); // Reset flag = "00";
        this.portFlag = 'D';
      } else {
        this.portFlag = '';
      }
      // if (this.flag === '00') this.flag = '41';
      this.flag = '41';
      this.prevPortD = value;
      this.delayTime = new Date();
      if (
        this.runner.portD.pinState(0) !== AVR8.PinState.Input &&
        this.runner.portD.pinState(0) !== AVR8.PinState.InputPullUp
      ) {
        this.pinNameMap[`RX0`].setValue((value & 1) * 5.0, null);
      }

      if (
        this.runner.portD.pinState(1) !== AVR8.PinState.Input &&
        this.runner.portD.pinState(1) !== AVR8.PinState.InputPullUp
      ) {
        this.pinNameMap[`TX0`].setValue(((value >> 1) & 1) * 5.0, null);
      }

      for (let i = 2; i <= 7; ++i) {
        if (
          this.runner.portD.pinState(i) !== AVR8.PinState.Input &&
          this.runner.portD.pinState(i) !== AVR8.PinState.InputPullUp
        ) {
          this.pinNameMap[`D${i}`].setValue(((value >> i) & 1) * 5.0, null);
        }
      }
    });

    // Flag to control automatic scrolling
    let shouldScrollToBottom = true;
    const msg = document.getElementById('msg');

     // Scroll Listener in console
    msg.addEventListener('scroll', () => {
      const isScrolledToBottom = msg.scrollHeight - msg.clientHeight <= msg.scrollTop + 1;
      shouldScrollToBottom = isScrolledToBottom;
    });

    this.runner.usart.onByteTransmit = (value) => {
      {
        // TODO: Show On Console
        const isScrolledToBottom = msg.scrollHeight - msg.clientHeight <= msg.scrollTop + 1;
        myOutput.textContent += String.fromCharCode(value);

        if (shouldScrollToBottom && isScrolledToBottom) {
          // Scroll to bottom if both conditions are met
          msg.scrollTop = msg.scrollHeight;
        }
      }
    };
     // Appending output to console
    msg.appendChild(myOutput);
    msg.scrollTop = msg.scrollHeight;
    this.pinNameMap['5V'].setValue(5, null);
    this.pinNameMap['3.3V'].setValue(3.3, null);

    if (this.servos.length > 0) {
      for (const ser of this.servos) {
        this.runner.addServo(ser.port, ser.pin, ser.call, ser.pwm);
      }
      this.servos = [];
    }
    this.runner.execute();

    // Handle Input Pull Up on portB pins
    for (let i = 0; i <= 5; ++i) {
      // check if pin state is inputPullUp
      if (this.runner.portB.pinState(i) === AVR8.PinState.InputPullUp) {
        // set pullUpEnabled boolean to true
        this.pinNameMap[`D${i + 8}`].pullUpEnabled = true;
        // set pin value to 1 by default
        this.runner.portB.setPin(i, 1);
      }
    }
    // Handle Input Pull Up on portD pins
    for (let i = 2; i <= 7; ++i) {
      // check if pin state is inputPullUp
      if (this.runner.portD.pinState(i) === AVR8.PinState.InputPullUp) {
        // set pullUpEnabled boolean to true
        this.pinNameMap[`D${i}`].pullUpEnabled = true;
        // set pin value to 1 by default
        this.runner.portD.setPin(i, 1);
      }
    }
    this.trackUsedPins();
    this.checkPinMismatches();
  }
  /**
   * Remove arduino runner on stop simulation.
   */
  closeSimulation(): void {
    if (this.runner) {
      this.runner.delete();
      this.runner = null;
    }
    if (this.builtinLED) {
      this.builtinLED.remove();
      this.builtinLED = null;
    }
    if (this.powerLed) {
      this.powerLed.remove();
      this.powerLed = null;
    }
  }
  /**
   * Add Servo to the queue
   * @param pin Circuit node where servo is connected
   * @param callback Callback which needs to call on change in PWM
   */
  addServo(pin: Point, callback: (angle: number, prevAngle: number) => void) {
    const tmp = this.getPort(pin.label);
    this.servos.push({
      port: tmp.name,
      pin: tmp.pin,
      call: callback
    });
  }
  /**
   * Add PWM to the queue
   * @param pin Circuit node where pwm component is connected
   * @param callback Callback on change in pwm (The Value needs to be divided by 100)
   */
  addPWM(pin: Point, callback: (volt: number, prev: number) => void) {
    const tmp = this.getPort(pin.label);
    if (this.runner) {
      this.runner.addServo(
        tmp.name,
        tmp.pin,
        callback,
        true
      );
    } else {
      this.servos.push({
        port: tmp.name,
        pin: tmp.pin,
        call: callback,
        pwm: true
      });
    }
  }
  /**
   * Returns the port name and pin mumber
   * @param pinName Circuit Node Name
   */
  getPort(pinName: string) {
    const num = parseInt(pinName.substr(1), 10);
    if (!isNaN(num)) {
      if (num >= 0 && num <= 7) {
        return { name: 'portD', pin: num };
      } else if (num > 7 && num <= 13) {
        return { name: 'portB', pin: num - 8 };
      }
    }
  }


  EmitValueChangeEvent() {
    const value = (this.prevPortB << 8) | (this.prevPortD & 255);
    GraphDataService.voltageChange.emit({
      value,
      time: this.delayTime,
      arduino: { id: this.id, name: this.name },
    });
    this.flag = '00';
    // this.portFlag = '';
  }
}
