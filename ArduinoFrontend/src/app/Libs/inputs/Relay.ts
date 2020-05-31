import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class Relay extends CircuitElement {
  static pointHalf = 5;

  constructor(public canvas: any, public x: number, y: number) {
    super('RelayModule', x, y, 'Relay.json', canvas);
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
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Relay Module',
      body
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
