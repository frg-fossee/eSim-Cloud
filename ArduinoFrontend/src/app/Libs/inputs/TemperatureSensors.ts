import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class LM35 extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('LM35', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/LM35.svg', this.x, this.y, 29, 73),
    );
    this.nodes = [
      new Point(canvas, x - 1, y + 64, 'Power', LM35.pointHalf, this),
      new Point(canvas, x + 10, y + 64, 'Vout', LM35.pointHalf, this),
      new Point(canvas, x + 22, y + 64, 'GND', LM35.pointHalf, this),
    ];

    this.setDragListeners();
    this.setHoverListener();
    this.setClickListener(null);
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
      body,
      title: 'Photo Resistor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
