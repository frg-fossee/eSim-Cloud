import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class Potentiometer extends CircuitElement {
  static pointHalf = 5;
  constructor(public canvas: any, x: number, y: number) {
    super('Potentiometer', x, y, 'Potentiometer.json', canvas);
    // const anim = Raphael.animation({transform: 'r360'}, 2500).repeat(Infinity);
    // this.elements[1].animate(anim);
  }
  save() {
  }
<<<<<<< HEAD
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
      title: 'Potentiometer',
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
