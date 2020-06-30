import { TaskScheduler } from './Scheduler';
import { parseHex } from './IntelHex';

/**
 * AVR8 Global Variable
 */
declare var AVR8: any;

/**
 * Event to change the Value of a pin after some duration in microseconds
 */
export interface MicroEvent {
  /**
   * State of the Pin
   */
  state: boolean;
  /**
   * Pin Number
   */
  pin: number;
  /**
   * Port register
   */
  port: string;
  /**
   * Start of the clock
   */
  start: number;
  /**
   * Complete time period in microsecond
   */
  period: number;
  /**
   * Is Event enabled
   */
  enable: boolean;
}

/**
 * PWM Event
 */
export interface ServoEvent {
  /**
   * Pin where component is attached
   */
  pin: number;
  /**
   * Start time of the event
   */
  start: number;
  /**
   * prev value of pwm (angle in case of servo)
   */
  prevAngle: number;
  /**
   * is we only need pwm output
   */
  isPWM?: boolean;
  /**
   * Port where component is attached.
   */
  port?: string;
  /**
   * Callback with current value and previous value
   */
  callback: (angle: number, prevAngle: number) => void;
}

/**
 * Arduino Program Loop class ie. Arduino runner
 */
export class ArduinoRunner {
  /**
   * Program Data
   */
  readonly program = new Uint16Array(0x8000);
  /**
   * Arduino CPU
   */
  readonly cpu: any;
  /**
   * Arduino Timer 0
   */
  readonly timer0: any;
  /**
   * Arduino Timer 1
   */
  readonly timer1: any;
  /**
   * Arduino Timer 2
   */
  readonly timer2: any;
  /**
   * Arduino register Port B
   */
  readonly portB: any;
  /**
   * Arduino register Port C
   */
  readonly portC: any;
  /**
   * Arduino register Port D
   */
  readonly portD: any;
  /**
   * Arduino Universal Synchronous/Asynchronous Receiver/Transmitter
   */
  readonly usart: any;
  /**
   * Arduino Analog to Digital Convertor
   */
  readonly adc: any;
  /**
   * Arduino Frequency
   */
  readonly frequency = 16e6;
  /**
   * Task Scheduler for Arduino
   */
  readonly scheduler: TaskScheduler = new TaskScheduler();
  /**
   * Work Unit Cycles
   */
  readonly workUnitCycles = 500000; // TODO: FIGURE OUT
  /**
   * All microseconds event
   */
  private events: MicroEvent[] = [];
  /**
   * List for all PWM events
   */
  private servo: ServoEvent[] = [];
  /**
   * Port Listeners
   */
  private listeners: any = {};
  /**
   * Contains Serial data
   */
  private serialBuffer: string[] = [];
  /**
   * Arduino runner constructor
   * @param hex Compiled Hex string
   */
  constructor(hex: string) {
    // Parse the compiled hex
    parseHex(hex, new Uint8Array(this.program.buffer));
    // initialize variables
    this.cpu = new AVR8.CPU(this.program);
    this.timer0 = new AVR8.AVRTimer(this.cpu, AVR8.timer0Config);
    this.timer1 = new AVR8.AVRTimer(this.cpu, AVR8.timer1Config);
    this.timer2 = new AVR8.AVRTimer(this.cpu, AVR8.timer2Config);
    this.portB = new AVR8.AVRIOPort(this.cpu, AVR8.portBConfig);
    this.portC = new AVR8.AVRIOPort(this.cpu, AVR8.portCConfig);
    this.portD = new AVR8.AVRIOPort(this.cpu, AVR8.portDConfig);
    this.usart = new AVR8.AVRUSART(this.cpu, AVR8.usart0Config, this.frequency);
    this.adc = new AVR8.ADC(this.cpu);
    // Start the scheduler
    this.scheduler.start();
  }
  /**
   * The Execute loop
   */
  execute() {
    // Complete work unit cycle
    const cyclesToRun = this.cpu.cycles + this.workUnitCycles;
    while (this.cpu.cycles < cyclesToRun) {
      AVR8.avrInstruction(this.cpu); // Parse the instruction
      // Update timers
      this.timer0.tick();
      this.timer1.tick();
      this.timer2.tick();
      this.usart.tick();
      // For handling microsecond events
      for (const event of this.events) {
        const ms = Math.floor(((this.cpu.cycles - event.start) * 1000000) / this.frequency);
        if (event.enable && ms !== 0 && ms % event.period === 0) {
          this[event.port].setPin(event.pin, event.state);
          event.state = !event.state;
          event.start = this.cpu.cycles;
        }
      }
    }
    // Send Serial data to the arduino
    if (((this.cpu.data[0xc0] >> 7) & 1) === 0 && this.serialBuffer.length > 0) {
      const chr = this.serialBuffer.shift();
      this.cpu.data[0xc6] = chr.charCodeAt(0) & 255;
      let tmp = this.cpu.data[0xc0];
      tmp &= ~(1 << 6);
      tmp &= ~(1 << 5);
      tmp |= (1 << 7);
      this.cpu.writeData(0xc0, tmp);
    }
    // add task to queue
    this.scheduler.postTask(() => this.execute());
  }
  /**
   * Return Miliseconds of time span
   * @param seconds CPU Seconds
   */
  getmiliS(seconds: number) {
    const ms = Math.floor(seconds * 1000) % 1000;
    return ms;
  }
  /**
   * Returns Microsecond of timespan
   * @param seconds CPU Seconds
   */
  getMicroSeconds(seconds: number) {
    return (seconds * 1000000) % 1000000;
  }
  /**
   * Delete The runner
   */
  delete() {
    this.events = null;
    this.servo = null;
    this.listeners = null;
    this.scheduler.stop();
  }
  /**
   * Stop the scheduler
   */
  stop() {
    this.scheduler.stop();
  }
  /**
   * Add microsecond event
   * @param event Micro second event
   */
  addMicroEvent(event: MicroEvent) {
    return this.events.push(event) - 1;
  }
  /**
   * Get the Microsecond event
   * @param index Index of Microevent
   */
  getMicroEvent(index: number): MicroEvent {
    // TODO: Check index is in range
    return this.events[index];
  }
  /**
   * Add a PWM EVENT
   * @param port The PWM Port
   * @param pin The PWM Pin
   * @param callback callback to send pwm value
   * @param isPwm isPwm or servo (if servo the callback will get angle)
   */
  addServo(port: string, pin: number, callback: (angle: number, prevAngle: number) => void, isPwm = false) {
    // Add the event to the queue
    this.servo.push({
      pin,
      prevAngle: -10,
      start: 0,
      callback,
      isPWM: isPwm,
      port
    });

    if (!(port in this.listeners)) {
      this[port].addListener((value) => {
        for (const item of this.servo) {
          if (port !== item.port) {
            continue;
          }

          // Logic for handling PWM
          if (((value >> item.pin) & 1) === 1) {
            item.start = this.cpu.cycles;
          } else {
            if (item.start === 0) {
              continue;
            }
            const seconds = ((this.cpu.cycles - item.start) * 1000000) / this.frequency;
            let ang = 0.0;
            if (item.isPWM) {
              ang = (Math.floor(seconds) - 7) / 4.048;
              ang = Math.floor(ang);
            } else {
              ang = (Math.floor(seconds) - 543) / 10.316;
              ang = Math.floor(ang);
            }
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
  /**
   * Add serial input to the buffer
   * @param inp Input String that needs to be sent
   */
  serialInput(inp: string) {
    this.serialBuffer = inp.split('');
  }
}
