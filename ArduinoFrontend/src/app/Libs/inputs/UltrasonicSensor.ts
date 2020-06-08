import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
/**
 * Ultrasonic Sensor class
 */
export class UltrasonicSensor extends CircuitElement {
  /**
   * Ultrasonic constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, public x: number, y: number) {
    super('UltrasonicSensor', x, y, 'UltrasonicSensor.json', canvas);
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
