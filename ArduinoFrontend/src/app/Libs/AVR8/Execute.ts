import { TaskScheduler } from './Scheduler';
import { parseHex } from './IntelHex';

declare var AVR8: any;

export interface MicroEvent {
  state: boolean;
  pin: number;
  port: string;
  start: number;
  period: number;
  enable: boolean;
}

export interface ServoEvent {
  pin: number;
  start: number;
  prevAngle: number;
  callback: (angle: number, prevAngle: number) => void;
}

export class ArduinoRunner {
  readonly program = new Uint16Array(0x8000);
  readonly cpu: any;
  readonly timer0: any;
  readonly timer1: any;
  readonly timer2: any;
  readonly portB: any;
  readonly portC: any;
  readonly portD: any;
  readonly usart: any;
  readonly adc: any;
  readonly frequency = 16e6;
  readonly scheduler: TaskScheduler = new TaskScheduler();
  readonly workUnitCycles = 500000; // TODO: FIGURE OUT
  private events: MicroEvent[] = [];
  private servo: ServoEvent[] = [];
  private listeners: any = {};
  private serialBuffer: string[] = [];

  constructor(hex: string) {
    parseHex(hex, new Uint8Array(this.program.buffer));
    this.cpu = new AVR8.CPU(this.program);
    this.timer0 = new AVR8.AVRTimer(this.cpu, AVR8.timer0Config);
    this.timer1 = new AVR8.AVRTimer(this.cpu, AVR8.timer1Config);
    this.timer2 = new AVR8.AVRTimer(this.cpu, AVR8.timer2Config);
    this.portB = new AVR8.AVRIOPort(this.cpu, AVR8.portBConfig);
    this.portC = new AVR8.AVRIOPort(this.cpu, AVR8.portCConfig);
    this.portD = new AVR8.AVRIOPort(this.cpu, AVR8.portDConfig);
    this.usart = new AVR8.AVRUSART(this.cpu, AVR8.usart0Config, this.frequency);
    this.adc = new AVR8.ADC(this.cpu);

    // this.addServo('portD', 3, (k) => console.log(k));
    // this.addServo('portD', 5, (k) => console.log(k));
    this.scheduler.start();
  }

  execute() {
    const cyclesToRun = this.cpu.cycles + this.workUnitCycles;
    while (this.cpu.cycles < cyclesToRun) {
      AVR8.avrInstruction(this.cpu);
      this.timer0.tick();
      this.timer1.tick();
      this.timer2.tick();
      this.usart.tick();
      for (const event of this.events) {
        const ms = Math.floor(((this.cpu.cycles - event.start) * 1000000) / this.frequency);
        if (event.enable && ms !== 0 && ms % event.period === 0) {
          this[event.port].setPin(event.pin, event.state);
          event.state = !event.state;
          event.start = this.cpu.cycles;
        }
      }
    }

    if (((this.cpu.data[0xc0] >> 7) & 1) === 0 && this.serialBuffer.length > 0) {
      const chr = this.serialBuffer.shift();
      this.cpu.data[0xc6] = chr.charCodeAt(0) & 255;
      let tmp = this.cpu.data[0xc0];
      tmp &= ~(1 << 6);
      tmp &= ~(1 << 5);
      tmp |= (1 << 7);
      this.cpu.writeData(0xc0, tmp);
    }

    this.scheduler.postTask(() => this.execute());
  }
  getmiliS(seconds: number) {
    const ms = Math.floor(seconds * 1000) % 1000;
    return ms;
  }
  getMicroSeconds(seconds: number) {
    return (seconds * 1000000) % 1000000;
  }
  delete() {
    // TODO: Delete
    this.events = null;
    this.servo = null;
    this.listeners = null;
    this.scheduler.stop();
  }
  stop() {

    this.scheduler.stop();
  }
  addMicroEvent(event: MicroEvent) {
    return this.events.push(event) - 1;
  }
  getMicroEvent(index: number): MicroEvent {
    // TODO: Check index is in range
    return this.events[index];
  }
  addServo(port: string, pin: number, callback: (angle: number, prevAngle: number) => void) {
    this.servo.push({
      pin,
      prevAngle: -10,
      start: 0,
      callback
    });

    if (!(port in this.listeners)) {
      this[port].addListener((value) => {
        for (const item of this.servo) {
          if (((value >> item.pin) & 1) === 1) {
            item.start = this.cpu.cycles;
          } else {
            if (item.start === 0) {
              continue;
            }
            const seconds = ((this.cpu.cycles - item.start) * 1000000) / this.frequency;
            let ang = (Math.floor(seconds) - 543) / 10.316;
            ang = Math.floor(ang);
            if (
              (ang + 1) !== item.prevAngle &&
              (ang - 1) !== item.prevAngle &&
              ang !== item.prevAngle
            ) {
              callback(ang, item.prevAngle);
              item.prevAngle = ang;
            }
            item.start = 0;
          }

        }
      });
      this.listeners[port] = true;
    }
  }

  serialInput(inp: string) {
    this.serialBuffer = inp.split('');
  }
}
