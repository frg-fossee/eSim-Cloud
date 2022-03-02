import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { ArduinoUno } from '../outputs/Arduino';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Buzzer Class
 */
export class Buzzer extends CircuitElement {
  /**
   * Map pin name to the circuit node
   */
  pinNamedMap: any = {};
  /**
   * The oscillator for buzzer.
   */
  oscillator: any;
  /**
   * The Arduino uno which is connected to the Buzzer.
   */
  arduino: ArduinoUno;
  /**
   * Audio Context
   */
  audioCtx: AudioContext;
  /**
   * Toggle for wether buzzer is beeping or not.
   */
  sound = false;
  /**
   * Id for setInterval hook.
   */
  setIntervId: any;
  /**
   * pushbutton constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(private canvas: any, public x: number, public y: number) {
    super('Buzzer', x, y, 'Buzzer.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // console.log(this.nodes[0].label);
    // console.log(this.nodes[1].label);
    for (const x of this.nodes) {
      this.pinNamedMap[x.label] = x;
    }
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
  }
  /**
   * Logic for beeping sound
   * @param val The Value on the positive pin
   */
  logic(val: number) {
    // TODO: Handle PWM
    if (this.nodes[0].connectedTo && this.nodes[1].connectedTo) {
      if (val === 5) {
        if (this.oscillator && !this.sound) {
          this.oscillator.connect(this.audioCtx.destination);
          this.sound = true;
        }
      } else {
        if (this.oscillator && this.sound) {
          this.oscillator.disconnect(this.audioCtx.destination);
          this.sound = false;
        }
      }
      this.nodes[1].setValue(val, null);
    } else {
      // TODO: Show Toast
      window.showToast('Buzzer is not Connected properly');
    }
  }
  /**
   * returns properties object
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties() {
    const body = document.createElement('div');
    return {
      title: 'Buzzer',
      keyName: this.keyName,
      id: this.id,
      body
    };
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation() {
    const trig = (this.pinNamedMap['POSITIVE'] as Point);
    if (trig.connectedTo) {
      if (trig.connectedTo.start.parent instanceof ArduinoUno) {
        this.arduino = trig.connectedTo.start.parent;
      } else if (trig.connectedTo.end.parent instanceof ArduinoUno) {
        this.arduino = trig.connectedTo.end.parent;
      } 
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'square';
    this.oscillator.frequency.value = 2300;
    var prescaler = [8, 32, 64, 128, 256, 1024];
    this.setIntervId = setInterval(() => {
      try {
        var tccr2b = this.arduino.runner.timer2.TCCRB;
        var ocr2a = this.arduino.runner.timer2.ocrA;
        if (ocr2a != 0){
          this.oscillator.frequency.value = Math.round(16000000/(2*prescaler[tccr2b-2]*(ocr2a+1)));
        }
      } catch (error) {
      }
    }, 10);
    this.oscillator.start();
  }
  /** Function removes all callbacks  */
  closeSimulation() {
    if (this.oscillator && this.sound) {
      this.oscillator.disconnect(this.audioCtx.destination);
      this.sound = false;
    }
    this.audioCtx = null;
    this.oscillator = null;
    setTimeout(() => {
      clearInterval(this.setIntervId);
    }, 100);
  }
}
