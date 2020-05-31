import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class PIRSensor extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('PIRSensor', x, y, 'PIRSensor.json', canvas);
  }
<<<<<<< HEAD
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
=======
>>>>>>> master
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('body');
    return {
      keyName: this.keyName,
      body,
      title: 'PIR Sensor',
      id: this.id
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
