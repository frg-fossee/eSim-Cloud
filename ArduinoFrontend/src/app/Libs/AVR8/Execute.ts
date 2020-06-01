import { TaskScheduler } from './Scheduler';
import { parseHex } from './IntelHex';

declare var AVR8: any;
// declare var window: any;

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
  readonly speed = 16e6;
  readonly scheduler: TaskScheduler = new TaskScheduler();
  readonly workUnitCycles = 500000; // TODO: FIGURE OUT
  constructor(hex: string) {
    parseHex(hex, new Uint8Array(this.program.buffer));
    this.cpu = new AVR8.CPU(this.program);
    this.timer0 = new AVR8.AVRTimer(this.cpu, AVR8.timer0Config);
    this.timer1 = new AVR8.AVRTimer(this.cpu, AVR8.timer1Config);
    this.timer2 = new AVR8.AVRTimer(this.cpu, AVR8.timer2Config);
    this.portB = new AVR8.AVRIOPort(this.cpu, AVR8.portBConfig);
    this.portC = new AVR8.AVRIOPort(this.cpu, AVR8.portCConfig);
    this.portD = new AVR8.AVRIOPort(this.cpu, AVR8.portDConfig);
    this.usart = new AVR8.AVRUSART(this.cpu, AVR8.usart0Config, this.speed);
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
    }
    this.scheduler.postTask(() => this.execute());
  }
  delete() {
    // TODO: Delete
    this.scheduler.stop();
  }
  stop() {
    this.scheduler.stop();
  }
}
