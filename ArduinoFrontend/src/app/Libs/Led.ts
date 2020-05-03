import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LED extends CircuitElement {
  static pointHalf = 4;
  color = '#f00'; // Color of LED
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y);
    let tmp = `M${this.x - 10},${this.y + 10}C${this.x - 10},${this.y},`;
    tmp += `${this.x + 10},${this.y},${this.x + 10},${this.y + 10}L${this.x + 10},`;
    tmp += `${this.y + 30}L${this.x + 14},${this.y + 30}L${this.x + 14},`;
    tmp += `${this.y + 35}L${this.x - 14},${this.y + 35}L${this.x - 14},${this.y + 30}L${this.x - 10},${this.y + 30}`;

    let tmp2 = `M${this.x - 5},${this.y + 35}L${this.x - 5},`;
    tmp2 += `${this.y + 40}L${this.x - 10},${this.y + 45}L${this.x - 10},${this.y + 70}`;

    this.elements.push(
      this.canvas.path(tmp),
      this.canvas.path(tmp2),
      // Create negative terminal as line
      this.canvas.path(`M${this.x + 5},${this.y + 35} L${this.x + 5},${this.y + 70}Z`)
    );
    // this.elements.scale(0.5,0.5);
    this.nodes = [
      new Point(this.canvas,
        this.x - 15,
        this.y + 64,
        'POSITIVE',
        LED.pointHalf,
        this),
      new Point(this.canvas,
        this.x + 1,
        this.y + 64,
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
