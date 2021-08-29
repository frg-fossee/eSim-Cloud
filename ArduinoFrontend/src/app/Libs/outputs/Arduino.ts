import { CircuitElement } from '../CircuitElement';
import { ArduinoRunner } from '../AVR8/Execute';
import { isUndefined, isNull } from 'util';
import { Point } from '../Point';

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
  /**
   * Servo attached to an arduino
   */
  private servos: any[] = [];
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

    this.runner.usart.onByteTransmit = (value) => {
      /// TODO: Show On Console
      myOutput.textContent += String.fromCharCode(value);
    };

    document.getElementById('msg').append(myOutput);
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
}
