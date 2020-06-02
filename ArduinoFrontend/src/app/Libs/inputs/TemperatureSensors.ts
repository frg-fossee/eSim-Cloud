import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { Slider } from './Slider';

export class LM35 extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('LM35', x, y, 'LM35.json', canvas);
  }
  init() {
    const y = new Slider(this.canvas, this.x, this.y - 10);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Temperatur Sensor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
