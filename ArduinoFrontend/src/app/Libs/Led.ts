import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LED extends CircuitElement {
  static pointHalf = 4;
  color = '#802020'; // Color of LED
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
      this.canvas.path(`M${this.x + 5},${this.y + 35} L${this.x + 5},${this.y + 70}Z`),
      // this.canvas.circle(x, y + 5, 30)
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
    // this.elements[3].attr({ fill: 'r(0.5, 0.5)rgba(255,0,0,0.7)-rgba(255,0,0,0.2)', stroke: 'none' });
    // this.elements[3].glow
    //   ({
    //     width: 50,
    //     color: '#f00'
    //   });
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

export class RGBLED extends CircuitElement {
  static pointHalf = 4;
  static legAttr = {
    stroke: '#8C8C8C',
    'stroke-linecap': 'round',
    'stroke-width': '4'
  };
  constructor(public canvas: any, x: number, y: number) {
    super('RGBLED', x, y);
    this.elements.push(
      canvas.image('assets/images/components/RGBLED.svg', this.x, this.y, 50, 104),
      canvas.path(`M${x + 38.9},${y + 33.3}V${y + 15}
      c0-8.3-6.4-15-14.4-15S${x + 10.2},${y + 6.7},${x + 10.2},${y + 15}
      v18.3v4.5v7.4c2.9,2.5,8.2,4.2,14.4,4.2c9.2,0,16.7-3.8,16.7-8.6c0-0.5,0-2.5,0-3.1
      C${x + 41.2},${y + 36.1},${x + 40.4},${y + 34.6},${x + 38.9},${y + 33.3}z`)
        .attr({
          fill: 'none',
          stroke: '#888888',
          'stroke-width': '1'
        })
    );
    this.nodes = [
      new Point(canvas, x - 3, y + 95, 'RED', RGBLED.pointHalf, this),
      new Point(canvas, x + 12, y + 95, 'CATHODE', RGBLED.pointHalf, this),
      new Point(canvas, x + 29, y + 95, 'BLUE', RGBLED.pointHalf, this),
      new Point(canvas, x + 46, y + 95, 'GREEN', RGBLED.pointHalf, this),
    ];
    this.setDragListeners();
    this.setClickListener(null);
    this.setHoverListener();
  }
  anim() {
    this.elements[1].attr({
      fill: 'rgba(255,0,0,0.8)'
    });
    this.elements[1].glow({
      color: 'rgb(255,0,0)'
    });
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
      title: 'RGB LED',
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
