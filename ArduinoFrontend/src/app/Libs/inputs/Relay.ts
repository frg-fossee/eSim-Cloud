import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
/**
 * Relay Module Class
 */
export class Relay extends CircuitElement {
  /**
   * Relay Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, public x: number, y: number) {
    super('RelayModule', x, y, 'Relay.json', canvas);
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
