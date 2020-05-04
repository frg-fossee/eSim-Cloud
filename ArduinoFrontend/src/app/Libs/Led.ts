import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LED extends CircuitElement {
  static pointHalf = 4;
  color = '#f00'; // Color of LED
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y);
    let tmp = `M${this.x - 20},${this.y + 20}C${this.x - 20},${this.y},`;
    tmp += `${this.x + 20},${this.y},${this.x + 20},${this.y + 20}L${this.x + 20},`;
    tmp += `${this.y + 60}L${this.x + 28},${this.y + 60}L${this.x + 28},`;
    tmp += `${this.y + 70}L${this.x - 28},${this.y + 70}L${this.x - 28},${this.y + 60}L${this.x - 20},${this.y + 60}`;

    let tmp2 = `M${this.x - 10},${this.y + 70}L${this.x - 10},`;
    tmp2 += `${this.y + 80}L${this.x - 20},${this.y + 90}L${this.x - 20},${this.y + 140}`;

    this.elements.push(
      this.canvas.path(tmp),
      this.canvas.path(tmp2),
      // Create negative terminal as line
      this.canvas.path(`M${this.x + 10},${this.y + 70} L${this.x + 10},${this.y + 140}Z`)
    );
    this.nodes = [
      new Point(this.canvas,
        this.x - 22,
        this.y + 138,
        'POSITIVE',
        LED.pointHalf,
        this),
      new Point(this.canvas,
        this.x + 8,
        this.y + 138,
        'NEGATIVE',
        LED.pointHalf,
        this)
    ];
    this.elements[0].attr({ fill: this.color, stroke: this.color });
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
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'LED'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
