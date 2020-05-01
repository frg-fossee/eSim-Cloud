import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class Battery9v extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('Battery9v', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/9vBattery.svg', this.x, this.y, 179, 99)
    );
    this.nodes = [
      new Point(canvas, x, y + 27, 'Positive', Battery9v.pointHalf, this),
      new Point(canvas, x, y + 69, 'Negative', Battery9v.pointHalf, this)
    ];
    this.setDragListeners();
    this.setClickListener(null);
    this.setHoverListener();
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
      keyName: 'Battery9v',
      id: this.id,
      body,
      title: '9v Battery'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
