import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class PushButton extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y, 'PushButton.json', canvas);
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


export class SlideSwitch extends CircuitElement {
  static pointHalf = 4;
  private reverseAnim = true;

  constructor(public canvas: any, x: number, y: number) {
    super('SlideSwitch', x, y, 'SlideSwitch.json', canvas);
  }
  anim() {
    let anim;
    if (this.reverseAnim) {
      anim = Raphael.animation({ transform: 't15,0' }, 500);
    } else {
      anim = Raphael.animation({ transform: 't0,0' }, 500);
    }
    this.elements[1].animate(anim);
    this.reverseAnim = !this.reverseAnim;
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
      title: 'Slide Switch'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
