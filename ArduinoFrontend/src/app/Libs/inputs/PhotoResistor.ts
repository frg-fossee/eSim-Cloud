import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class PhotoResistor extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('PhotoResistor', x, y, 'PhotoResistor.json', canvas);
  }
  load(data: any): void {
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Photo Resistor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
