import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class PIRSensor extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('PIRSensor', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/PIRSensor.svg', this.x, this.y, 198, 168)
    );
    this.nodes = [
      new Point(canvas, x + 81, y + 161, 'SIGNAL', PIRSensor.pointHalf, this),
      new Point(canvas, x + 96, y + 161, 'VCC', PIRSensor.pointHalf, this),
      new Point(canvas, x + 110, y + 161, 'GND', PIRSensor.pointHalf, this),
    ];

    this.setClickListener(null);
    this.setDragListeners();
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
