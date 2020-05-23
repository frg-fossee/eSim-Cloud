import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class LED extends CircuitElement {
  static pointHalf = 4;
  static colors: string[] = []; // Color of LED
  static glowColors: string[] = [];
  static colorNames: string[] = [];
  selectedIndex = 0;
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y, 'LED.json', canvas);
  }
  init() {
    if (LED.glowColors.length === 0) {
      // LED
      console.log(this.data);
      LED.colors = this.data.colors;
      LED.colorNames = this.data.colorNames;
      LED.glowColors = this.data.glowcolors;
    }
    this.data = null;
  }
  anim() {
    this.elements[3].attr({
      fill: `r(0.5, 0.5)${LED.glowColors[this.selectedIndex]}`
    });
  }
  getName() {
    // TODO: Change Accordingly to Color
    return `LED Red`;
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
