import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class Potentiometer extends CircuitElement {
  static pointHalf = 5;
  constructor(public canvas: any, x: number, y: number) {
    super('Potentiometer', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/Potentiometer.svg', this.x, this.y, 109.3, 122.975),
      this.canvas.image('assets/images/components/PotentiometerAbove.svg', this.x + 13.3, this.y + 12.5, 82.6, 82.6),
    );
    this.nodes = [
      new Point(canvas, x + 28, y + 114, 'Terminal 1', Potentiometer.pointHalf, this),
      new Point(canvas, x + 51, y + 114, 'WIPER', Potentiometer.pointHalf, this),
      new Point(canvas, x + 74, y + 114, 'Terminal 2', Potentiometer.pointHalf, this),
    ];
    this.setClickListener(null);
    this.setDragListeners();
    this.setHoverListener();

    // const anim = Raphael.animation({transform: 'r360'}, 2500).repeat(Infinity);
    // this.elements[1].animate(anim);
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
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
