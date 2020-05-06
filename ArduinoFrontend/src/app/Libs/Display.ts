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
  static pointHalf = 4;
  static sevenBarPoints = [
    [
      [24.1, 22.6],
      [20.9, 25.3],
      [16.3, 51.7],
      [19.3, 55.3],
      [23.8, 51.5],
      [28.1, 27.3]
    ],
    [
      [52.2, 52.9],
      [25, 52.9],
      [20.4, 56.7],
      [23.4, 60.3],
      [51.1, 60.3],
      [55.4, 56.7]
    ],
    [
      [19, 57.9],
      [14.5, 61.6],
      [10, 87.1],
      [10, 87.1],
      [9.9, 87.7],
      [12.5, 90.9],
      [17.6, 86.6],
      [22, 61.5]
    ],
    [
      [47.6, 94.5],
      [50.4, 92.1],
      [46.2, 87.1],
      [19.9, 87.1],
      [13.7, 92.3],
      [15.5, 94.5]
    ],
    [
      [54.2, 89],
      [59.1, 61.2],
      [56.6, 58.1],
      [51.4, 62.5],
      [47.3, 85.5],
      [51.9, 91]
    ],
    [
      [60.7, 52.4],
      [65.7, 24],
      [64.5, 22.6],
      [57.4, 28.5],
      [53.4, 51.4],
      [56.8, 55.5]
    ],
    [
      [28.6, 18.9],
      [25.6, 21.4],
      [29.6, 26.3],
      [57.2, 26.3],
      [63.3, 21.2],
      [61.4, 18.9]
    ]
  ];
  static dotColor = { fill: '#505355', stroke: 'none' };
  static barColor = '#B2B2B2';
  static barGlowColor = '#FFA500';
  static mapping = [18, 17, 16, 15, 14, 12, 13, 1];
  glows = [null, null, null, null, null, null, null, null];

  constructor(public canvas: any, x: any, y: any) {
    super('SevenSegment', x, y);
    this.elements.push(
      canvas.rect(x, y, 76, 113, 3)
        .attr({ fill: '#252626', stroke: 'none' }),
      canvas.circle(x + 62, y + 91, 4)
        .attr({ fill: '#B2B2B2', stroke: 'none' }),
      canvas.circle(x + 7, y + 11, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 22, y + 11, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 37, y + 11, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 52, y + 11, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 68, y + 11, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 7, y + 102, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 22, y + 102, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 37, y + 102, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 52, y + 102, 2)
        .attr(SevenSegment.dotColor),
      canvas.circle(x + 68, y + 102, 2)
        .attr(SevenSegment.dotColor),
    );
    this.drawBars();

    this.nodes = [
      new Point(canvas, x + 3, y + 7, 'g', SevenSegment.pointHalf, this),
      new Point(canvas, x + 18, y + 7, 'f', SevenSegment.pointHalf, this),
      new Point(canvas, x + 33, y + 7, 'COMMON', SevenSegment.pointHalf, this),
      new Point(canvas, x + 48, y + 7, 'a', SevenSegment.pointHalf, this),
      new Point(canvas, x + 64, y + 7, 'b', SevenSegment.pointHalf, this),
      new Point(canvas, x + 3, y + 98, 'e', SevenSegment.pointHalf, this),
      new Point(canvas, x + 18, y + 98, 'd', SevenSegment.pointHalf, this),
      new Point(canvas, x + 33, y + 98, 'COMMON', SevenSegment.pointHalf, this),
      new Point(canvas, x + 48, y + 98, 'C', SevenSegment.pointHalf, this),
      new Point(canvas, x + 64, y + 98, 'DP', SevenSegment.pointHalf, this)
    ];

    this.setDragListeners();
    this.setClickListener(null);
    this.setHoverListener();
  }
  drawBars() {
    for (const points of SevenSegment.sevenBarPoints) {
      let tmp = 'M';
      for (const point of points) {
        tmp += `${this.x + point[0]},${this.y + point[1]}L`;
      }
      tmp = tmp.substr(0, tmp.length - 1) + 'z';
      this.elements.push(
        this.canvas.path(tmp).
          attr({ fill: SevenSegment.barColor, stroke: 'none' })
      );
    }
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
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
