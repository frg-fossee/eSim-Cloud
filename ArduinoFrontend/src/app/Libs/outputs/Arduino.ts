import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { ArduinoRunner } from '../AVR8/Execute';

declare var AVR8;

export class ArduinoUno extends CircuitElement {
  static prefix = 'Arduino UNO R3 ';
  public name: string;
  public code = 'void setup(){\n\t\n}\n\nvoid loop(){\n\t\n}';
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
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
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
    // console.log(this.runner);
    this.runner.portB.addListener((value) => {
      for (let i = 0; i <= 5; ++i) {
        if (
          this.runner.portB.pinState(i) !== AVR8.PinState.Input ||
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
        this.runner.portB.pinState(0) !== AVR8.PinState.Input ||
        this.runner.portB.pinState(0) !== AVR8.PinState.InputPullUp
      ) {
        this.pinNameMap[`RX0`].setValue((value & 1) * 5.0, null);
      }

      if (
        this.runner.portB.pinState(1) !== AVR8.PinState.Input ||
        this.runner.portB.pinState(1) !== AVR8.PinState.InputPullUp
      ) {
        this.pinNameMap[`TX0`].setValue(((value >> 1) & 1) * 5.0, null);
      }

      for (let i = 2; i <= 7; ++i) {
        if (
          this.runner.portB.pinState(i) !== AVR8.PinState.Input ||
          this.runner.portB.pinState(i) !== AVR8.PinState.InputPullUp
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

    this.runner.execute();
  }
  closeSimulation(): void {
    this.runner.delete();
    this.runner = null;
    this.builtinLED.remove();
    this.builtinLED = null;
    this.powerLed.remove();
    this.powerLed = null;
  }
  simulate(): void {
  }

}
