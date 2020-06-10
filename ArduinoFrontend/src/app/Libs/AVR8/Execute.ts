import { TaskScheduler } from './Scheduler';
import { parseHex } from './IntelHex';

declare var AVR8: any;
// declare var window: any;

export interface MicroEvent {
  state: boolean;
  pin: number;
  port: string;
  start: number;
  period: number;
  enable: boolean;
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
    this.scheduler.postTask(() => this.execute());
  }
  getMicroSeconds(seconds: number) {
    return (seconds * 1000000) % 1000000;
  }
  delete() {
    // TODO: Delete
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
}
