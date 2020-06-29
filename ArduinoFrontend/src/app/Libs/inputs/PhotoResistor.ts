import { CircuitElement } from '../CircuitElement';
import { Slider } from './Slider';
/**
 * Class Photoresistor
 */
export class PhotoResistor extends CircuitElement {
  slide: Slider;
  valueText: any;
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
  getValue(r: number) {
    let tmp = r;
    let suffix = 'Ω';
    if (tmp > 1000) {
      tmp /= 1000;
      suffix = 'K' + suffix;
    }
    return `${Math.round((tmp) * 100) / 100}${suffix}`;
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    this.valueText = this.canvas.text(this.x + this.tx + 120, this.y + this.ty - 40, '90.25KΩ');
    this.valueText.attr({
      'font-size': 15
    });
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.setGradient('#69644b', '#ffd500');
    this.slide.setValueChangeListener((v) => {
      const tmp = (1 - v) * 179500 + 500; // Temperature
      // console.log(tmp);
      // console.log([tmp, (tmp + 50) / 100]);
      // this.nodes[1].setValue((tmp + 50) / 100, null);
      this.valueText.attr({
        text: this.getValue(tmp)
      });
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
