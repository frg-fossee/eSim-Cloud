import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var window;
/**
 * LED class
 */
export class LED extends CircuitElement {
  static colors: string[] = []; // Color of LED
  static glowColors: string[] = []; // color to be shown while glowing
  static colorNames: string[] = []; // Name of Color of LED
  selectedIndex = 0; // Selectedindex wrt to color
  prev = -2;
  /**
   * LED constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y, 'LED.json', canvas);
  }
  /** Saves data of selected color wrt its index */
  SaveData() {
    return {
      color: this.selectedIndex
    };
  }
  /**
   * Function Called to Load data from saved object
   * @param data Saved Object
   */
  LoadData(data: any) {
    this.selectedIndex = data.data.color;
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    if (LED.glowColors.length === 0) {
      // LED
      // console.log(this.data);
      LED.colors = this.data.colors;
      LED.colorNames = this.data.colorNames;
      LED.glowColors = this.data.glowcolors;
    }
    this.data = null;
    // Add value Change Listener to Circuit nodes
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
    this.elements[0].attr({
      fill: LED.colors[this.selectedIndex]
    });
  }
  /** Simulation Logic */
  logic(val: number) {
    // console.log(val);
    if (this.prev === val) {
      return;
    }
    this.prev = val;
    if (this.nodes[0].connectedTo && this.nodes[1].connectedTo) {
      // console.log(this.nodes[0].value);
      if (val >= 5) {
        this.anim();
      } else {
        this.elements[3].attr({ fill: 'none' });
      }
      if (val >= 0) {
        this.nodes[1].setValue(val, null);
      }
    } else {
      // TODO: Show Toast
      window.showToast('LED is not Connected properly');
    }
  }
  /** animation caller when start simulation is pressed */
  anim() {
    this.elements[3].attr({
      fill: `r(0.5, 0.5)${LED.glowColors[this.selectedIndex]}`
    });
  }
  getName() {
    // TODO: Change Accordingly to Color
    return `LED Red`;
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
    const select = document.createElement('select');
    const label = document.createElement('label');
    label.innerText = 'LED Color';
    let tmp = '';
    for (const name of LED.colorNames) {
      tmp += `<option>${name}</option>`;
    }
    select.innerHTML = tmp;
    select.selectedIndex = this.selectedIndex;
    select.onchange = () => {
      this.elements[0].attr({
        fill: LED.colors[select.selectedIndex]
      });
      this.selectedIndex = select.selectedIndex;
    };
    body.append(label);
    body.append(select);
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'LED'
    };
  }
  initSimulation(): void {
  }
  /** Function removes all the animations */
  closeSimulation(): void {
    this.prev = -2;
    this.elements[3].attr({ fill: 'none' });
  }
  simulate(): void {
  }
}
/**
 * RGBLED class
 */
export class RGBLED extends CircuitElement {
  glow: any = null;
  /**
   * RGBLED constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('RGBLED', x, y, 'RGBLED.json', canvas);
  }
  init() {
    this.nodes[0].addValueListener((v) => {
      this.nodes[1].setValue(v, this.nodes[0]);
      this.anim();
    });
    this.nodes[2].addValueListener((v) => {
      this.nodes[1].setValue(v, this.nodes[0]);
      this.anim();
    });
    this.nodes[3].addValueListener((v) => {
      this.nodes[1].setValue(v, this.nodes[0]);
      this.anim();
    });
  }
  /** animation caller when start simulation is pressed */
  anim() {
    if (this.glow) {
      this.glow.remove();
      this.glow = null;
    }
    let R = (this.nodes[0].value > 0) ? 255 : 0;
    let B = (this.nodes[2].value > 0) ? 255 : 0;
    let G = (this.nodes[3].value > 0) ? 255 : 0;
    if (R === 0 && G === 0 && B === 0) {
      this.elements[1].attr({
        fill: 'none'
      });
      return;
    }
    if (R === 255 && G === 255 && B === 255) {
      R = G = B = 209;
    }
    this.elements[1].attr({
      fill: `rgba(${R},${G},${B},0.8)`
    });
    this.glow = this.elements[1].glow({
      color: `rgb(${R},${G},${B})`
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
      title: 'RGB LED',
      body
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
    if (this.glow) {
      this.glow.remove();
      this.glow = null;
    }
    this.elements[1].attr({
      fill: 'none'
    });
  }
  simulate(): void {
  }
}
