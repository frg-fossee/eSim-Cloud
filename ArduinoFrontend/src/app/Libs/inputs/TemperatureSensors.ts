import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { Slider } from './Slider';

export class TMP36 extends CircuitElement {
  slide: Slider;
  constructor(public canvas: any, x: number, y: number) {
    super('TMP36', x, y, 'TMP36.json', canvas);
  }
  init() {
    console.log(this.nodes[0].label);
    console.log(this.nodes[2].label);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Temperatur Sensor'
    };
  }
  setValue(val: number) {
    if (
      this.nodes[0].connectedTo && this.nodes[0].value >= 4.9 &&
      this.nodes[2].connectedTo
    ) {
      this.nodes[1].setValue(val, null);
    } else {
      window['showToast']('Please Connect Wires Properly');
    }
  }
  initSimulation(): void {
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.minv = 0;
    this.slide.maxv = 1;
    this.slide.setValueChangeListener((v) => {
      const tmp = v * 165 + -40; // Temperature
      // console.log([tmp, (tmp + 50) / 100]);
      // this.nodes[1].setValue((tmp + 50) / 100, null);
      this.setValue((tmp + 50) / 100);
    });
    this.setValue(0.925);
  }
  closeSimulation(): void {
    this.slide.remove();
    delete this.slide;
    this.slide = null;
  }
  simulate(): void {
  }
}
