import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class Relay extends CircuitElement {
  static pointHalf = 5;

  constructor(public canvas: any, public x: number, y: number) {
    super('RelayModule', x, y);

    this.elements.push(
      this.canvas.image('assets/images/components/1ChannelRelay.svg', this.x, this.y, 118, 204)
    );
    this.nodes = [
      new Point(canvas, x + 33, y + 18, 'Normally Closed', Relay.pointHalf, this),
      new Point(canvas, x + 56, y + 18, 'COMMON', Relay.pointHalf, this),
      new Point(canvas, x + 81, y + 18, 'Normally Open', Relay.pointHalf, this),
      new Point(canvas, x + 54, y + 197, 'SIG', Relay.pointHalf, this),
      new Point(canvas, x + 68, y + 197, 'VCC', Relay.pointHalf, this),
      new Point(canvas, x + 84, y + 197, 'GND', Relay.pointHalf, this),
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
      title: 'Relay Module',
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
