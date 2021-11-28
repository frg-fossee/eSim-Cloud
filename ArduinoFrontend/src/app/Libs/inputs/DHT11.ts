import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point'
import { Slider } from './Slider';

/**
 * DHT11 Sensor class
 */
export class DHT11 extends CircuitElement {
    /**
     * Slider to change temperature
     */
    slide1: Slider;
    /**
     * Slider to change Humidity
     */
    slide2: Slider;
    /**
     * Raphael text element for showing temperature value.
     */
    valueText1: any;
    /**
     * Raphael text element for showing humidity value.
     */
    valueText2: any;
    /**
     * DHT11 Sensor constructor
     * @param canvas Raphael Canvas (Paper)
     * @param x  position x
     * @param y  position y
     */
    constructor(public canvas: any, x: number, y: number) {
        super('DHT11', x, y, 'DHT11.json', canvas);
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
          title: 'DHT11 Sensor'
        };
      }
      /** sets value for nodes */
    setValue(val: number) {
    if (
      this.nodes[0].connectedTo && this.nodes[0].value >= 4.9 &&
      this.nodes[2].connectedTo
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
    this.valueText1 = this.canvas.text(this.x + this.tx + 50, this.y + this.ty + 0, '22.38°C');
    this.valueText1.attr({
      'font-size': 15
    });
    this.valueText2 = this.canvas.text(this.x + this.tx + 80, this.y + this.ty + 20, '50%');
    this,valueText2.attr({
        'font-size': 15
    });
    this.slide1 = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide1.setGradient('#03b5fc', '#fc6203');
    this.slide1.setValueChangeListener((v) => {
      const tmp = v * 50; // Temperature
      // this.nodes[1].setValue((tmp + 50) / 100, null);
      // console.log([tmp, (tmp + 50) / 100]);
      this.valueText.attr({
        text: `${Math.round((tmp) * 100) / 100}°C`
      });
      this.setValue((tmp + 50) / 100);
    });
    this.setValue(0.925);
    this.slide2 = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide2.setGradient('#03b5fc', '#fc6203');
    this.slide2.setValueChangeListener((v) => {
      const humidity = v * 80 + 20; //humidity
      this.valueText.attr({
        text: `${Math.round((humidity) * 100) / 100}%`
      });
      this.setValue((humidity + 50) / 100);
    });
    this.setValue(0.925);
  }
  /** remove slider and text */
  closeSimulation(): void {
    this.valueText1.remove();
    this.valueText2.remove();
    this.slide1.remove();
    this.slide2.remove();
    delete this.slide1;
    delete this.slide2;
    this.slide1 = null;
    this.slide2= null;
  }
}