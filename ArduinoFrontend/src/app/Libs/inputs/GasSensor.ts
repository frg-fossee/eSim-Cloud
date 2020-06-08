import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

/**
 * Class GasSensor MQ2
 */
export class MQ2 extends CircuitElement {
  /**
   * Gas Sensor Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('MQ2', x, y, 'MQ2.json', canvas);
  }
  /**
   * Function provides component details
   * @param keyName  Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
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
