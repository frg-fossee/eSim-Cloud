import { CircuitElement } from '../CircuitElement';
import { ArduinoRunner } from '../AVR8/Execute';
import { isUndefined, isNull } from 'util';

declare var AVR8;

export class ArduinoUno extends CircuitElement {
  static prefix = 'Arduino UNO R3 '; // TODO: fetch from json
  public name: string;
  public code = 'void setup(){\n\t\n}\n\nvoid loop(){\n\t\n}'; // TODO: fetch from json
  public runner: ArduinoRunner;
  public hex: string;
  public powerLed: any;
  public builtinLED: any;
  public pinNameMap: any = {};
  constructor(public canvas: any, x: number, y: number) {
    super('ArduinoUno', x, y, 'Arduino.json', canvas);
    let start = window['scope']['ArduinoUno'].length + 1;
    this.name = ArduinoUno.prefix + start;
    while (window['ArduinoUno_name'][this.name]) {
      ++start;
      this.name = ArduinoUno.prefix + start;
    }
    window['ArduinoUno_name'][this.name] = this;
  }
  init() {
    for (const node of this.nodes) {
      this.pinNameMap[node.label] = node;
    }
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

    this.pinNameMap['D12'].addValueListener((v) => {
      if (isUndefined(this.runner) || isNull(this.runner)) {
        setTimeout(() => {
          this.pinNameMap['D12'].setValue(v, this.pinNameMap['D12']);
        }, 300);
        return;
      } else {
        if (this.runner.portB.pinState(4) === AVR8.PinState.Input) {
          this.runner.portB.setPin(4, v > 0 ? 1 : 0);
        }
      }
    });
    // For Port B D5 - D13
    for (let i = 0; i <= 5; ++i) {
      this.pinNameMap[`D${i + 8}`].addValueListener((v) => {
        console.log([i, v]);
        if (isUndefined(this.runner) || isNull(this.runner)) {
          setTimeout(() => {
            this.pinNameMap[`D${i + 8}`].setValue(v, this.pinNameMap[`D${i + 8}`]);
          }, 300);
          return;
        }
        if (this.runner.portB.pinState(i) === AVR8.PinState.Input) {
          this.runner.portB.setPin(i, v > 0 ? 1 : 0);
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
        if (this.runner.portD.pinState(i) === AVR8.PinState.Input) {
          this.runner.portD.setPin(i, v > 0 ? 1 : 0);
        }
      });
    }
  }
  SaveData() {
    return {
      name: this.name,
      code: this.code
    };
  }
  LoadData(data: any) {
    this.name = data.data.name;
    this.code = data.data.code;
    // console.log(data);
  }
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
  delete() {
    delete window['ArduinoUno_name'][this.name];
  }
  initSimulation(): void {
    this.builtinLED = this.elements[1].glow({
      color: '#ffff00'
    });
    this.builtinLED.hide();
    this.powerLed = this.elements[2].glow({
      color: '#00ff00'
    });
    const myOutput = document.createElement('pre');
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
    this.runner.execute();
  }
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
  simulate(): void {
  }
  getPort(pinName: string) {
    const num = parseInt(pinName.substr(1), 10);
    if (!isNaN(num)) {
      if (num >= 0 && num <= 7) {
        return { name: 'portD', pin: num };
      } else if (num > 7 && num <= 13) {
        return { name: 'portB', pin: num };
      }
    }
  }
}
