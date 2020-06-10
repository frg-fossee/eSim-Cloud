import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
declare var Raphael;
/**
 * Potentiometer Class
 */
export class Potentiometer extends CircuitElement {
  /**
   * Potentiometer constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('Potentiometer', x, y, 'Potentiometer.json', canvas);
    // const anim = Raphael.animation({transform: 'r360'}, 2500).repeat(Infinity);
    // this.elements[1].animate(anim);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    const attr = this.elements[1].attr();
    const center = {
      x: attr.x + attr.width / 2,
      y: attr.y + attr.height / 2
    };
    console.log(center);
    let prev = 0;
    // Set mousemove listener for the potentiometer
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
  /**
   * Function provides component details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
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
