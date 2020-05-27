import { Point } from '../Point';
import { CircuitElement } from '../CircuitElement';

declare var window; // Declare window so that custom created function don't throw error

/**
 * Buzzer Class
 */
export class Buzzer extends CircuitElement {
  oscillator: any;
  audioCtx: AudioContext;
  sound = false;
  constructor(private canvas: any, public x: number, public y: number) {
    super('Buzzer', x, y, 'Buzzer.json', canvas);
  }
  init() {
    // console.log(this.nodes[0].label);
    // console.log(this.nodes[1].label);
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
  }
  logic(val: number) {
    if (this.nodes[0].connectedTo && this.nodes[1].connectedTo) {
      // console.log(this.nodes[0].value);
      if (val === 5) {
        // this.anim();
        if (this.oscillator && !this.sound) {
          // this.oscillator.start();
          this.oscillator.connect(this.audioCtx.destination);
          this.sound = true;
        }
      } else {
        if (this.oscillator && this.sound) {
          // this.oscillator.stop();
          this.oscillator.disconnect(this.audioCtx.destination);
          this.sound = false;
        }
        // this.elements[3].attr({ fill: 'none' });
      }
      this.nodes[1].setValue(val, null);
    } else {
      // TODO: Show Toast
      window.showToast('LED is not Connected properly');
    }
  }
  // return propeties object
  properties() {
    const body = document.createElement('div');
    return {
      title: 'Buzzer',
      keyName: this.keyName,
      id: this.id,
      body
    };
  }
  // return save object
  save() {
    return {
      x: this.x,
      y: this.y,
      id: this.id
    };
  }
  // load data from saved object
  load(data: any) {
    this.x = data.x;
    this.y = data.y;
    this.id = data.id;
  }
  // returns node pointer on basis of x,y position
  getNode(x: number, y: number) {
    return null;
  }

  initSimulation() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.frequency.value = 2300;
    this.oscillator.start();
    // setTimeout(()=>oscillator.stop(),1000);
    // oscillator.start();
    // console.log(this.oscillator)
  }
  simulate() {
    // TODO: Play Music on Simulation
  }
  closeSimulation() {
    if (this.oscillator && this.sound) {
      // this.oscillator.stop();
      this.oscillator.disconnect(this.audioCtx.destination);
      this.sound = false;
    }
    this.audioCtx = null;
    this.oscillator = null;
  }
}
