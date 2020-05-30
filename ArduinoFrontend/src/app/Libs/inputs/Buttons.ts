import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class PushButton extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y, 'PushButton.json', canvas);
  }
  load(data: any): void {
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
  load(data: any): void {
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
