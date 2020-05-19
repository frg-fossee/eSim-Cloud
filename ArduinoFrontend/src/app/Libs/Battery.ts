import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class Battery9v extends CircuitElement {
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('Battery9v', x, y, 'Battery9v.json', canvas);
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
      keyName: 'Battery9v',
      id: this.id,
      body,
      title: '9v Battery'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}


export class CoinCell extends CircuitElement {
  static pointHalf = 5;
  constructor(public canvas: any, x: number, y: number) {
    super('CoinCell', x, y, 'CoinCell.json', canvas);
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
      body,
      title: 'Coin Cell'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
