import { CircuitElement } from '../CircuitElement';
import { Vector } from './Collision';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Potentiometer Class
 */
export class Potentiometer extends CircuitElement {
  /**
   * Types of potentiometer name.
   */
  static variants: string[];
  /**
   * Types of potentiometer resistance
   */
  static variantsValue: number[];
  /**
   * Selected potentiometer type.
   */
  selectedIndex: number;
  /**
   * Potentiometer constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('PotentioMeter', x, y, 'Potentiometer.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    Potentiometer.variants = this.data.variants;
    Potentiometer.variantsValue = this.data.value;
    this.data.value = [];
    this.data.variants = [];
    this.data = null;
  }
  /**
   * Returns the client point respective to the svg
   * @param x X positon
   * @param y y position
   */
  svgPoint(x, y) {
    const pt = window['holder_svg'].createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(window.canvas.canvas.getScreenCTM().inverse());
  }
  /**
   * Rotates the dial and sets the analog value
   * @param center Center of the Potentiometer
   * @param clientX Mouse X
   * @param clientY Mouse Y
   */
  rotateDial(center: Vector, clientX: number, clientY: number) {
    const point = this.svgPoint(clientX, clientY);
    const difX = point.x - center.x;
    const difY = point.y - center.y;
    let ang = Math.atan2(difY, difX);
    if (ang < 0) {
      ang += 2 * Math.PI;
    }
    // if(line){
    //   line.remove();
    //   line = null;
    // }
    // const ex = center.x + 100*Math.cos(ang);
    // const ey = center.y + 100*Math.sin(ang);
    // line = this.canvas.path(`M${center.x},${center.y}L${ex},${ey}`)
    ang *= (180 / Math.PI);
    ang = (ang + 225) % 360;
    if (ang > 268) {
      ang = 268;
    }
    // console.log(ang / 268);
    const to = Math.max(
      this.nodes[0].value,
      this.nodes[1].value
    );
    if (to < 0) {
      window['showToast']('Potentiometer Not Connected');
      return;
    }
    const intp = (ang / 268) * to;
    this.elements[1].transform(`r${ang}`);

    this.nodes[1].setValue(intp, this.nodes[1]);
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
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    const label = document.createElement('label');
    label.innerText = 'Resistance';
    const select = document.createElement('select');
    let tmp = '';
    for (const val of Potentiometer.variants) {
      tmp += `<option>${val} &#8486;</option>`;
    }
    select.innerHTML = tmp;
    select.selectedIndex = this.selectedIndex;
    select.onchange = () => {
      this.selectedIndex = select.selectedIndex;
    };
    body.append(label);
    body.append(select);
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Potentiometer',
      body
    };
  }
  /**
   * Called on start simulation. Add Event listener.
   */
  initSimulation(): void {
    if (
      !(this.nodes[0].connectedTo &&
        this.nodes[1].connectedTo &&
        this.nodes[2].connectedTo)) {
      // console.log("ss")
    }
    const attr = this.elements[1].attr();
    const center = {
      x: attr.x + attr.width / 2 + this.tx,
      y: attr.y + attr.height / 2 + this.ty
    };
    this.elements[1].transform(`t0,0`);
    this.elements[1].attr({
      x: attr.x + this.tx,
      y: attr.y + this.ty
    });
    this.elements.undrag();
    this.elements.unmousedown();
    this.elements.drag((_, __, mX, mY) => {
      this.rotateDial(center, mX, mY);
    }, (mX, mY) => {
      this.rotateDial(center, mX, mY);
    },
      (ev: MouseEvent) => {
        this.rotateDial(center, ev.clientX, ev.clientY);
      });
    console.log('val')
    this.nodes[1].setValue(0, this.nodes[1]);
  }
  /**
   * Save the Selected type in database
   */
  SaveData() {
    return {
      value: this.selectedIndex
    };
  }
  /**
   * Load the Selected type.
   * @param data Saved Data
   */
  LoadData(data: any) {
    if (data.data && data.data.value > 0) {
      this.selectedIndex = data.data.value;
    } else {
      this.selectedIndex = 0;
    }
  }
  /**
   * Reset transformation add add event listeners.
   */
  closeSimulation(): void {
    const attr = this.elements[1].attr();
    this.elements[1].attr({
      x: attr.x - this.tx,
      y: attr.y - this.ty
    });
    this.elements[1].transform(`t${this.tx},${this.ty}`);
    this.elements.undrag();
    this.elements.unmousedown();
    this.setClickListener(null);
    this.setDragListeners();
  }
}
