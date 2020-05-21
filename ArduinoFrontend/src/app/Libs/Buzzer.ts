import { Point } from './Point';
import { CircuitElement } from './CircuitElement';

declare var window; // Declare window so that custom created function don't throw error

/**
 * Buzzer Class
 */
export class Buzzer extends CircuitElement {
  constructor(private canvas: any, public x: number, public y: number) {
    super('Buzzer', x, y, 'Buzzer.json', canvas);
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
    // let AudioContext = window.AudioContext || window.webkitAudioContext;
    // let audioCtx = new AudioContext();
    // let oscillator = audioCtx.createOscillator();
    // oscillator.frequency.value = Buzzer.specification.frequency;
    // oscillator.connect(audioCtx.destination);
    // oscillator.start();
    // setTimeout(()=>oscillator.stop(),1000);
  }
  simulate() {
    // TODO: Play Music on Simulation
  }
  closeSimulation() {

  }
}
