import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var window;

export class LED extends CircuitElement {
  static colors: string[] = []; // Color of LED
  static glowColors: string[] = [];
  static colorNames: string[] = [];
  selectedIndex = 0;
  prev = -2;
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y, 'LED.json', canvas);
  }
  SaveData() {
    return {
      color: this.selectedIndex
    };
  }
  LoadData(data: any) {
    this.selectedIndex = data.data.color;
  }
  init() {
    if (LED.glowColors.length === 0) {
      // LED
      // console.log(this.data);
      LED.colors = this.data.colors;
      LED.colorNames = this.data.colorNames;
      LED.glowColors = this.data.glowcolors;
    }
    this.data = null;
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
    this.elements[0].attr({
      fill: LED.colors[this.selectedIndex]
    });
}
  logic(val: number) {
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
      this.nodes[1].setValue(val, null);
    } else {
      // TODO: Show Toast
      window.showToast('LED is not Connected properly');
    }
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
    this.prev = -2;
    this.elements[3].attr({ fill: 'none' });
  }
  simulate(): void {
  }
}

export class RGBLED extends CircuitElement {
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
