import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class UltrasonicSensor extends CircuitElement {
  static pointHalf = 4;

  constructor(public canvas: any, public x: number, y: number) {
    super('UltrasonicSensor', x, y);

    this.elements.push(
      this.canvas.image('assets/images/components/UltrasonicSensor.svg', this.x, this.y, 203, 103.5)
    );
    this.nodes = [
      new Point(canvas, x + 78, y + 100, 'VCC', UltrasonicSensor.pointHalf, this),
      new Point(canvas, x + 88, y + 100, 'TRIG', UltrasonicSensor.pointHalf, this),
      new Point(canvas, x + 100, y + 100, 'ECHO', UltrasonicSensor.pointHalf, this),
      new Point(canvas, x + 110, y + 100, 'GND', UltrasonicSensor.pointHalf, this),
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
      keyName: this.keyName,
      id: this.id,
      title: 'Ultrasonic Distance Sensor',
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
