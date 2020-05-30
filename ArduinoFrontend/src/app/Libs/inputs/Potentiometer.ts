import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class Potentiometer extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('Potentiometer', x, y, 'Potentiometer.json', canvas);
    // const anim = Raphael.animation({transform: 'r360'}, 2500).repeat(Infinity);
    // this.elements[1].animate(anim);
  }
  init() {
    const attr = this.elements[1].attr();
    const center = {
      x: attr.x + attr.width / 2,
      y: attr.y + attr.height / 2
    };
    console.log(center);
    let prev = 0;
    this.elements[1].mousemove((ev: MouseEvent) => {
      // this.elements[1].rotate(-prev);
      const difX = ev.clientX - center.x;
      const difY = ev.clientY - center.y;
      let ang = Math.atan2(difY, difX) * 180 / Math.PI;
      if (difX > 0 && difY > 0) {
        ang += 180;
      } else {
        ang -= 180;
      }
      this.elements[1].transform(`r${ang}`);
      // ang -= prev;
      // this.elements[1].rotate(
      //   ang
      // );
      prev = ang;
      // console.log();
    });
  }
  load(data: any): void {
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Potentiometer',
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
