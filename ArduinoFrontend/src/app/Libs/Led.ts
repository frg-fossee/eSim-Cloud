import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LED extends CircuitElement {
  static pointHalf = 4;
  static colors: string[]; // Color of LED
  static glowColors: string[];

  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y, 'LED.json', canvas);
  }
  init() {

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
  constructor(public canvas: any, x: number, y: number) {
    super('RGBLED', x, y, 'RGBLED.json', canvas);
  }
  anim() {
    // TODO: Remove
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
