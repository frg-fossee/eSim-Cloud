import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

declare var Raphael;

export class Motor extends CircuitElement {
  static pointHalf = 4;

  constructor(public canvas: any, x: number, y: number) {
    super('Motor', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/Motor.svg', this.x, this.y, 69, 56),
      this.canvas.image('assets/images/components/MotorAbove.svg', this.x + 24, this.y + 17.5, 21, 21),
    );
    this.nodes = [
      new Point(canvas, x + 24, y + 51, 'NEGATIVE', Motor.pointHalf, this),
      new Point(canvas, x + 40, y + 51, 'POSITIVE', Motor.pointHalf, this),
    ];
    this.setClickListener(null);
    this.setDragListeners();
    this.setHoverListener();

    // const anim = Raphael.animation({transform: 'r360'}, 2500).repeat(Infinity);
    // this.elements[1].animate(anim);
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
      title: 'Motor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}


export class L298N extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('L298N', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/L298N.svg', this.x, this.y, 128, 128),
    );
    this.nodes = [
      new Point(canvas, x + 118, y + 9, 'ENB', Motor.pointHalf, this),
      new Point(canvas, x + 118, y + 19, 'IN4', Motor.pointHalf, this),
      new Point(canvas, x + 118, y + 29, 'IN3', Motor.pointHalf, this),
      new Point(canvas, x + 118, y + 39, 'IN2', Motor.pointHalf, this),
      new Point(canvas, x + 118, y + 49, 'IN1', Motor.pointHalf, this),
      new Point(canvas, x + 118, y + 59, 'ENA', Motor.pointHalf, this),
      new Point(canvas, x + 69, y + 3, 'Terminal 1', Motor.pointHalf, this),
      new Point(canvas, x + 82, y + 3, 'Terminal 2', Motor.pointHalf, this),
      new Point(canvas, x + 72, y + 117, 'Terminal 3', Motor.pointHalf, this),
      new Point(canvas, x + 84, y + 117, 'Terminal 4', Motor.pointHalf, this),
      new Point(canvas, x + 115, y + 77, '5V IN', Motor.pointHalf, this),
      new Point(canvas, x + 115, y + 97, '12V IN', Motor.pointHalf, this),
      new Point(canvas, x + 115, y + 87, 'GND', Motor.pointHalf, this),
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
    body.innerText = 'If you Don\'t Connect The ENA and ENB Pins it automatically connects to the 5V suppy';
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor Driver (L298N)'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
