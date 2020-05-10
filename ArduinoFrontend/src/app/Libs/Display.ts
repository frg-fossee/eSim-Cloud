import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LCD16X2 extends CircuitElement {
  static pointHalf = 3;
  constructor(public canvas: any, x: number, y: number) {
    super('LCD16X2', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/LCD16X2.svg', this.x, this.y, 256, 119.5),
    );
    this.nodes = [
      new Point(canvas, x + 20, y + 2, 'GND', LCD16X2.pointHalf, this),
      new Point(canvas, x + 28, y + 2, 'VCC', LCD16X2.pointHalf, this),
      new Point(canvas, x + 36, y + 2, 'V0', LCD16X2.pointHalf, this),
      new Point(canvas, x + 44, y + 2, 'RS', LCD16X2.pointHalf, this),
      new Point(canvas, x + 52, y + 2, 'RW', LCD16X2.pointHalf, this),
      new Point(canvas, x + 61, y + 2, 'E', LCD16X2.pointHalf, this),
      new Point(canvas, x + 69, y + 2, 'DB0', LCD16X2.pointHalf, this),
      new Point(canvas, x + 77, y + 2, 'DB1', LCD16X2.pointHalf, this),
      new Point(canvas, x + 85, y + 2, 'DB2', LCD16X2.pointHalf, this),
      new Point(canvas, x + 93, y + 2, 'DB3', LCD16X2.pointHalf, this),
      new Point(canvas, x + 101, y + 2, 'DB4', LCD16X2.pointHalf, this),
      new Point(canvas, x + 109, y + 2, 'DB5', LCD16X2.pointHalf, this),
      new Point(canvas, x + 117, y + 2, 'DB6', LCD16X2.pointHalf, this),
      new Point(canvas, x + 125, y + 2, 'DB7', LCD16X2.pointHalf, this),
      new Point(canvas, x + 133, y + 2, 'LED ANODE(+VE)', LCD16X2.pointHalf, this),
      new Point(canvas, x + 141, y + 2, 'LED CATHODE(-VE)', LCD16X2.pointHalf, this),
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
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'LCD Display 16x2'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}

export class SevenSegment extends CircuitElement {
  static barColor: string;
  static barGlowColor: string;
  static mapping: number[] = [];
  glows = [];

  constructor(public canvas: any, x: any, y: any) {
    super('SevenSegment', x, y, 'SevenSegment.json', canvas);
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  init() {
    if (SevenSegment.mapping.length === 0) {
      SevenSegment.mapping = this.data.mapping;
      SevenSegment.barColor = this.data.barColor;
      SevenSegment.barGlowColor = this.data.barGlowColor;
      // Remove From memory
      this.data.mapping = null;
      this.data.barColor = null;
      this.data.barGlowColor = null;
      this.data = null;
    }
    for (const value of SevenSegment.mapping) {
      this.elements[value].attr({ fill: SevenSegment.barColor });
      this.glows.push(null);
    }
  }
  animate(value: number) {
    value = value & 0xFF;
    for (let i = 0; i < 8; ++i) {
      const x = this.elements[SevenSegment.mapping[i]];
      if (this.glows[i]) {
        this.glows[i].remove();
        this.glows[i] = null;
      }
      if ((value >> i) & 1) {
        x.attr({ fill: SevenSegment.barGlowColor });
        this.glows[i] = x.glow({ color: SevenSegment.barGlowColor, width: 2 });
      } else {
        x.attr({ fill: SevenSegment.barColor });
      }
    }
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Seven Segment Display'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
