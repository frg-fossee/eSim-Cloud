import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';


export class MQ2 extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('MQ2', x, y, 'MQ2.json', canvas);
  }
  load(data: any): void {
  }
  getNode(x: number, y: number) {
    return null;
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Gas Sensor (MQ-2)'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
