import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';


export class MQ2 extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('MQ2', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/GasSensor.svg', this.x, this.y, 96, 170),
    );
    this.nodes = [
      new Point(canvas, x + 24, y + 160, 'VCC', MQ2.pointHalf, this),
      new Point(canvas, x + 36, y + 160, 'GND', MQ2.pointHalf, this),
      new Point(canvas, x + 49, y + 160, 'D0', MQ2.pointHalf, this),
      new Point(canvas, x + 61, y + 160, 'A0', MQ2.pointHalf, this),
    ];
    this.setClickListener(null);
    this.setDragListeners();
    this.setHoverListener();
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number) {
    return null;
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Gas Sensor (MQ-2)'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
