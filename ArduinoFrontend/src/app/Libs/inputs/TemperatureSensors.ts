import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { Slider } from './Slider';
/**
 * Temperature Sensor LM35 class
 */
export class LM35 extends CircuitElement {
  /**
   * TemperatureSensor LM35 constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('LM35', x, y, 'LM35.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    const y = new Slider(this.canvas, this.x, this.y - 10);
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
      body,
      title: 'Temperatur Sensor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}
