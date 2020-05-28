import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class Relay extends CircuitElement {
  constructor(public canvas: any, public x: number, y: number) {
    super('RelayModule', x, y, 'Relay.json', canvas);
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
      title: 'Relay Module',
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
