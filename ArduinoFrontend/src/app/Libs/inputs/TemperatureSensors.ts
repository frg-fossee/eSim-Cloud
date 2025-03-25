import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { Slider } from './Slider';
/**
 * Temperature sensor TMP36
 */
export class TMP36 extends CircuitElement {
  /**
   * Slider to change temperature
   */
  slide: Slider;
  /**
   * Raphael text element for showing value.
   */
  valueText: any;
  /**
   * Constructor for temperature sensor
   * @param canvas Raphael Paper
   * @param x X position
   * @param y y Position
   */
  constructor(public canvas: any, x: number, y: number) {
    super('TMP36', x, y, 'TMP36.json', canvas);
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
  /** sets value for nodes */
  setValue(val: number) {
    if (
      this.nodes[0].connectedTo && this.nodes[0].value >= 4.9 &&
      this.nodes[2].connectedTo && this.nodes[1].connectedTo
    ) {
      this.nodes[1].setValue(val, null);
    } else {
      window['showToast']('Please Connect Wires Properly');
    }
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    this.valueText = this.canvas.text(this.x + this.tx + 120, this.y + this.ty - 40, '42.38°C');
    this.valueText.attr({
      'font-size': 15
    });
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.setGradient('#03b5fc', '#fc6203');
    this.slide.setValueChangeListener((v) => {
      const tmp = v * 165 + -40; // Temperature
      // this.nodes[1].setValue((tmp + 50) / 100, null);
      // console.log([tmp, (tmp + 50) / 100]);
      this.valueText.attr({
        text: `${Math.round((tmp) * 100) / 100}°C`
      });
      this.setValue((tmp + 50) / 100);
    });
    this.setValue(0.925);
  }

  /** remove slider and text */
  closeSimulation(): void {
    this.valueText.remove();
    this.slide.remove();
    delete this.slide;
    this.slide = null;
  }
}
