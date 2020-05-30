import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

export class UltrasonicSensor extends CircuitElement {
  constructor(public canvas: any, public x: number, y: number) {
    super('UltrasonicSensor', x, y, 'UltrasonicSensor.json', canvas);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Ultrasonic Distance Sensor',
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
