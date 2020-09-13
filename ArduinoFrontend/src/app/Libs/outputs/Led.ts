import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
/**
 * Declare window so that custom created function don't throw error
 */
declare var window;
/**
 * LED class
 */
export class LED extends CircuitElement {
  /**
   * Colors of LED
   */
  static colors: string[] = [];
  /**
   * color to be shown while glowing
   */
  static glowColors: string[] = [];
  /**
   * Name of Color of LED
   */
  static colorNames: string[] = [];
  /**
   * Selectedindex wrt to color
   */
  selectedIndex = 0;
  /**
   * Previous node value.
   */
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
  /**
   * fills color in the led
   * @param color color
   */
  fillColor(color) {
    this.elements[3].attr({ fill: color });
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
        this.fillColor('none');
      }
      if (val >= 0) {
        this.nodes[1].setValue(val, null);
      }
    } else {
      // TODO: Show Toast
      this.handleConnectionError();
      window.showToast('LED is not Connected properly');
    }
  }
  /**
   * Handles connection error
   */
  handleConnectionError() {
    this.fillColor('none');
  }
  /** animation caller when start simulation is pressed */
  anim() {
    this.fillColor(`r(0.5, 0.5)${LED.glowColors[this.selectedIndex]}`);
  }
  /**
   * Get The Led Name
   */
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
  /**
   * Called when start simulation.
   */
  initSimulation(): void {
  }
  /** Function removes all the animations */
  closeSimulation(): void {
    this.prev = -2;
    this.fillColor('none');
  }
}
/**
 * RGBLED class
 */
export class RGBLED extends CircuitElement {
  /**
   * Raphael Glow element
   */
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
  /**
   * Initialize RGB LED
   */
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
    // Simulation Logic
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
  /**
   * Removes glow
   */
  removeGlow() {
    if (this.glow) {
      this.glow.remove();
      this.glow = null;
    }
  }
  /**
   * Handles connection error
   */
  handleConnectionError() {
    this.removeGlow();
  }
  /**
   * Called on start simulation
   */
  initSimulation(): void {
  }
  /**
   * Remove Glow and clear the filling
   */
  closeSimulation(): void {
    this.removeGlow();
    this.elements[1].attr({
      fill: 'none'
    });
  }
}
