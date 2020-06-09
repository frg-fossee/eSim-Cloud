import { CircuitElement } from '../CircuitElement';
import { Collision } from './Collision';
/**
 * Ultrasonic Sensor class
 */
export class UltrasonicSensor extends CircuitElement {
  pinNamedMap: any = {};
  control: any;
  readonly linesAttr = {
    'stroke-width': 4,
    'stroke-dasharray': ['-.'],
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    stroke: '#828282'
  };
  Tline: any;
  Rline: any;
  /**
   * Ultrasonic constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, public x: number, y: number) {
    super('UltrasonicSensor', x, y, 'UltrasonicSensor.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // Create a mapping for node label to node
    for (const x of this.nodes) {
      this.pinNamedMap[x.label] = x;
    }
    // Add value Change Listener to Circuit nodes
    // console.log(this.pinNamedMap['TRIG']);
    this.pinNamedMap['TRIG'].addValueListener((v) => {
      // console.log(v);
      // if (v >= 5) {
        this.pinNamedMap['ECHO'].setValue(v, null);
      // } else {
        // this.pinNamedMap['ECHO'].setValue(0, null);
      // }
    });
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
  async test() {
    const x = performance.now();
    let y = x;
    return new Promise((res, _) => {
      while (y - x < 18.3) {
        y = performance.now();
      }
      this.pinNamedMap['ECHO'].setValue(5, null);
      res(true);
    });
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    // Control Center -> CC
    const CC = {
      x: this.x + this.tx + 102.5,
      y: this.y + this.ty - 30
    };
    const lineEndY = this.y + this.ty + 40;
    const lineTEnd = this.tx + this.x + 48;
    const lineREnd = this.tx + this.x + 152;
    this.Tline = this.canvas.path(`M${CC.x},${CC.y}L${lineTEnd},${lineEndY}`).attr(this.linesAttr);
    this.Rline = this.canvas.path(`M${CC.x},${CC.y}L${lineREnd},${lineEndY}`).attr(this.linesAttr);
    this.control = this.canvas.circle(this.x + this.tx + 102.5, this.y + this.ty - 30, 15);
    this.control.attr({
      fill: '#000'
    });
    console.log(Collision.EuclideanDistance(CC, { x: lineTEnd, y: lineEndY }));
    let tmp;
    this.control.drag((dx, dy) => {
      this.control.attr({
        cx: tmp.cx + dx,
        cy: tmp.cy + dy
      });
      this.Tline.attr({
        path: `M${tmp.cx + dx},${tmp.cy + dy}L${lineTEnd},${lineEndY}`
      });
      this.Rline.attr({
        path: `M${tmp.cx + dx},${tmp.cy + dy},L${lineREnd},${lineEndY}`
      });
      console.log(Collision.EuclideanDistance({
        x: tmp.cx + dx,
        y: tmp.cy + dy
      }, { x: lineTEnd, y: lineEndY }));
    }, () => {
      tmp = this.control.attr();
    }, () => {
    });
  }
  /** Function removes all callbacks  */
  closeSimulation(): void {
    this.Tline.remove();
    this.Rline.remove();
    this.control.remove();
    this.control = null;
    this.Tline = null;
    this.Rline = null;
  }
  simulate(): void {
  }
}
