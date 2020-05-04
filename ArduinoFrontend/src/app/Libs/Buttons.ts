import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class PushButton extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y);
    this.elements.push(
      this.canvas.rect(x + 10, y - 20, 5, 30, 5), // Terminal 1
      this.canvas.rect(x + 45, y - 20, 5, 30, 5), // Terminal 2
      this.canvas.rect(x + 10, y + 50, 5, 30, 5), // Terminal 3
      this.canvas.rect(x + 45, y + 50, 5, 30, 5), // Terminal 4
      this.canvas.rect(x, y, 60, 60, 10), // Main Rectangle body
      this.canvas.circle(x + 10, y + 10, 5), // Circle 1
      this.canvas.circle(x + 10, y + 50, 5), // Circle 2
      this.canvas.circle(x + 50, y + 10, 5), // Circle 3
      this.canvas.circle(x + 50, y + 50, 5), // Circle 4
      this.canvas.circle(x + 30, y + 30, 12) // Circle at the center
    );
    // Create Circuit nodes
    this.nodes = [
      new Point(canvas, x + 10, y - 20 - PushButton.pointHalf, 'Terminal 1b', PushButton.pointHalf, this),
      new Point(canvas, x + 45, y - 20 - PushButton.pointHalf, 'Terminal 2b', PushButton.pointHalf, this),
      new Point(canvas, x + 10, y + 80 - PushButton.pointHalf, 'Terminal 1a', PushButton.pointHalf, this),
      new Point(canvas, x + 45, y + 80 - PushButton.pointHalf, 'Terminal 2a', PushButton.pointHalf, this)
    ];
    // Change fill and stroke of the terminal
    for (let i = 0; i < 4; ++i) {
      this.elements[i].attr({ stroke: '#737373', fill: '#737373' });
    }
    // Change fill and stroke of the body
    this.elements[4].attr({ stroke: '#969696', fill: '#bfbfbf' });
    // Change fill and stroke of the circles
    for (let i = 5; i < 10; ++i) {
      this.elements[i].attr({ fill: '#383838', stroke: '#383838' });
    }

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
      keyName: 'PushButton',
      id: this.id,
      body,
      title: 'Push Button'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
