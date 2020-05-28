import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class LCD16X2 extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('LCD16X2', x, y, 'LCD16X2.json', canvas);
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
      title: 'LCD Display 16x2'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}

export class SevenSegment extends CircuitElement {
  static barColor: string;
  static barGlowColor: string;
  static mapping: number[] = [];
  glows = [];
  pinNamedMap: any = {};
  constructor(public canvas: any, x: any, y: any) {
    super('SevenSegment', x, y, 'SevenSegment.json', canvas);
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  init() {
    if (SevenSegment.mapping.length === 0) {
      SevenSegment.mapping = this.data.mapping;
      SevenSegment.barColor = this.data.barColor;
      SevenSegment.barGlowColor = this.data.barGlowColor;
    }
    for (const value of SevenSegment.mapping) {
      this.elements[value].attr({ fill: SevenSegment.barColor });
      this.glows.push(null);
    }
    // Remove From memory
    this.data.mapping = null;
    this.data.barColor = null;
    this.data.barGlowColor = null;
    this.data = null;
    // let x = 0;
    for (const node of this.nodes) {
      // console.log([x++, node.label]);
      if (node.label !== 'COMMON') {
        this.pinNamedMap[node.label] = node;
        node.addValueListener((v) => this.logic(v));
      }
    }
  }
  logic(_) {
    // console.log(k)
    let byte = 0;
    byte |= (this.pinNamedMap['a'].value > 0) ? 1 : 0;
    byte |= (this.pinNamedMap['b'].value > 0) ? 2 : 0;
    byte |= (this.pinNamedMap['C'].value > 0) ? 4 : 0;
    byte |= (this.pinNamedMap['d'].value > 0) ? 8 : 0;
    byte |= (this.pinNamedMap['e'].value > 0) ? 16 : 0;
    byte |= (this.pinNamedMap['f'].value > 0) ? 32 : 0;
    byte |= (this.pinNamedMap['g'].value > 0) ? 64 : 0;
    byte |= (this.pinNamedMap['DP'].value > 0) ? 128 : 0;
    // console.log(byte);
    this.animate(byte);
  }
  animate(value: number) {
    value = value & 0xFF;
    for (let i = 0; i < 8; ++i) {
      const x = this.elements[SevenSegment.mapping[i]];
      if (this.glows[i]) {
        this.glows[i].remove();
        this.glows[i] = null;
      }
      if ((value >> i) & 1) {
        x.attr({ fill: SevenSegment.barGlowColor });
        this.glows[i] = x.glow({ color: SevenSegment.barGlowColor, width: 2 });
      } else {
        x.attr({ fill: SevenSegment.barColor });
      }
    }
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Seven Segment Display'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
    this.animate(0);
  }
  simulate(): void {
  }

}
