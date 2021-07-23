import { CircuitElement } from '../CircuitElement';
import { Slider } from './Slider';
/**
 * Class Photoresistor
 */
export class PhotoResistor extends CircuitElement {
  /**
   * Slider to set the value of photo resistor
   */
  slide: Slider;
  /**
   * The Value of the photo resitor
   */
  valueText: any;

  maxVal = 1000;

  minVal = 10;

  /**
   * Photoresistor Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('PhotoResistor', x, y, 'PhotoResistor.json', canvas);
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
      title: 'Photo Resistor'
    };
  }
  /**
   * Returns a string on the basis of resistance
   * @param r Resistance
   */
  getValue(r: number) {
    // let tmp = r;
    // let suffix = 'Ω';
    // if (tmp > 1000) {
    //   tmp /= 1000;
    //   suffix = 'K' + suffix;
    // }
    return `${Math.round((r) * 100) / 100} lum`;
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    this.valueText = this.canvas.text(this.x + this.tx + 120, this.y + this.ty - 40, `${this.maxVal / 2} lum`);
    this.valueText.attr({
      'font-size': 15
    });
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.setGradient('#69644b', '#ffd500');
    let enable1 = this.nodes[1].value > this.nodes[0].value ? true : false;

    if (enable1) {
      let lum = (1 - (this.maxVal / 2)) * this.maxVal;
      let incoming = this.nodes[1].value;
      let val = incoming / (lum + 1);
      this.nodes[0].setValue(val, null);
    } else {
      let lum = (1 - (this.maxVal / 2)) * this.maxVal;
      let incoming = this.nodes[0].value;
      let val = incoming / (lum + 1);
      this.nodes[1].setValue(val, null);
    }

    this.slide.setValueChangeListener((v) => {

      let lum = (1 - v) * this.maxVal;
      if (enable1) {

        let incoming = this.nodes[1].value;
        let val = incoming / (lum + 1);
        this.nodes[0].setValue(val, null);
        this.valueText.attr({
          text: this.getValue(this.maxVal - lum)
        });

      } else {
        let incoming = this.nodes[0].value;

        let val = incoming / (lum + 1);
        console.log(val)
        this.nodes[1].setValue(val, null);
        this.valueText.attr({
          text: this.getValue(this.maxVal - lum)
        });

      }

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
}
