import { CircuitElement } from '../CircuitElement';
import { Slider } from './Slider';
/**
 * Class Photoresistor
 */
export class Thermistor extends CircuitElement {
  /**
   * Slider to set the value of photo resistor
   */
  slide: Slider;
  /**
   * The Value of the photo resitor
   */
  valueText: any;

  min = 0;
  maxVal = 1000
  /**
   * Photoresistor Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('Thermistor', x, y, 'Thermistor.json', canvas);
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
      title: 'Thermistor'
    };
  }
  /**
   * Returns a string on the basis of resistance
   * @param r Resistance
   */
  getValue(r: number) {
    return `${Math.round(r)} C`;
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    this.valueText = this.canvas.text(this.x + this.tx + 120, this.y + this.ty - 40, `${this.maxVal / 2} C`);
    this.valueText.attr({
      'font-size': 15
    });
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.setGradient('#69644b', '#ffd500');

    const enable1 = this.nodes[1].value > this.nodes[0].value ? true : false;
    // At starting set value to half of slider
    this.changeVal(enable1, 0.5);
    this.slide.setValueChangeListener((v) => {
      // Change slider's ouput value
      this.changeVal(enable1, v);
    });
  }
  /** Function removes all  animations and callbacks  */
  closeSimulation(): void {
    this.valueText.remove();
    this.slide.remove();
    delete this.slide;
    delete this.valueText;
    this.slide = null;
    this.valueText = null;
  }

  /**
     * Call this function to change ouput value of photoresistor
     * @param enable1 Pin to direct output on
     * @param v value of slider, ranges from 0-1
     */
  changeVal(enable1, v) {
    // calculate lumens according slider
    const lum = (v) * this.maxVal;
    // if enable1 is true
    if (enable1) {
      // calculate voltage value
      const incoming = this.nodes[1].value;
      // calculate output voltage
      const val = (lum / this.maxVal) * incoming;
      // set output voltage
      this.nodes[0].setValue(val, null);
      // update text
      this.valueText.attr({
        text: this.getValue(lum)
      });
    } else {
      // calculate voltage value
      const incoming = this.nodes[0].value;
      // calculate output voltage
      const val = (lum / this.maxVal) * incoming;
      // set output voltage
      this.nodes[1].setValue(val, null);
      // update text
      this.valueText.attr({
        text: this.getValue(lum)
      });

    }
  }

}
