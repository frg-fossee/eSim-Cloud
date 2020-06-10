import { CircuitElement } from '../CircuitElement';
import { Collision } from './Collision';
import { Point } from '../Point';
import { ArduinoUno } from '../outputs/Arduino';

/**
 * Ultrasonic Sensor class
 */
export class UltrasonicSensor extends CircuitElement {
  static readonly linesAttr = {
    'stroke-width': 4,
    'stroke-dasharray': ['-.'],
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    stroke: '#828282'
  };
  pinNamedMap: any = {};
  control: any;
  arduino: ArduinoUno;
  microEventIndex: number;
  Tline: any;
  Rline: any;
  valueText: any;
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
    // let timeout;
    // Add value Change Listener to Circuit nodes
    // console.log(this.pinNamedMap['TRIG']);
    this.pinNamedMap['TRIG'].addValueListener((v) => {
      // TODO: Handle On
      // if(v > 0){
      // if (this.arduino) {
      // if(v > 0){
      // clearTimeout(timeout);
      // this.arduino.runner.getMicroEvent(this.microEventIndex).enable = true;
      // }else{
      // timeout = setTimeout(() => {console.log('c') }, 24);
      // }
      // clearTimeout(timeout);
      // }
      // }
      // console.log(v);
      // if (v >= 5) {
      // this.pinNamedMap['ECHO'].setValue(v, null);
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
  getDistance() {

  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation(): void {
    this.valueText = this.canvas.text(this.x + this.tx + 253, this.ty + this.y, '16 CM').attr({
      'font-size': 30
    });
    let pinName;
    const trig = (this.pinNamedMap['ECHO'] as Point);
    if (trig.connectedTo) {
      if (trig.connectedTo.start.parent instanceof ArduinoUno) {
        pinName = trig.connectedTo.start.label;
        this.arduino = trig.connectedTo.start.parent;
      } else if (trig.connectedTo.end.parent instanceof ArduinoUno) {
        this.arduino = trig.connectedTo.end.parent;
        pinName = trig.connectedTo.end.label;
      } else {
        console.log('TODO: Write Simulation logic for other components');
      }
    }
    // Control Center -> CC
    const CC = {
      x: this.x + this.tx + 102.5,
      y: this.y + this.ty - 30
    };
    const lineEndY = this.y + this.ty + 40;
    const lineTEnd = this.tx + this.x + 48;
    const lineREnd = this.tx + this.x + 152;
    this.Tline = this.canvas.path(`M${CC.x},${CC.y}L${lineTEnd},${lineEndY}`).attr(UltrasonicSensor.linesAttr);
    this.Rline = this.canvas.path(`M${CC.x},${CC.y}L${lineREnd},${lineEndY}`).attr(UltrasonicSensor.linesAttr);
    this.control = this.canvas.circle(CC.x, CC.y, 15);
    this.control.attr({ fill: '#000' });
    let tmp;
    this.control.drag((dx, dy) => {
      CC.x = tmp.cx + dx;
      CC.y = tmp.cy + dy;
      this.control.attr({ cx: CC.x, cy: CC.y });
      this.Tline.attr({ path: `M${CC.x},${CC.y}L${lineTEnd},${lineEndY}` });
      this.Rline.attr({ path: `M${CC.x},${CC.y},L${lineREnd},${lineEndY}` });
      if (CC.y > (this.y + this.ty)) {
        this.valueText.attr({
          text: 'Behind\nThe\nSensor'
        });
        if (this.arduino) {
          this.arduino.runner.getMicroEvent(this.microEventIndex).period = 23200;
        }
        return;
      }
      if (this.arduino) {
        let dist = Collision.EuclideanDistance({ x: CC.x, y: CC.y }, {
          x: lineTEnd,
          y: lineEndY
        });
        const dist2 = Collision.EuclideanDistance({ x: CC.x, y: CC.y }, {
          x: lineREnd,
          y: lineEndY
        });

        dist = Math.floor((dist + dist2) / 35);
        dist = dist * dist;
        if (dist > 400 || dist < 4) {
          this.valueText.attr({
            text: `OUT\nOF\nRegion`
          });
        } else {
          this.valueText.attr({
            text: `${dist} CM`
          });
        }
        dist = Math.max(4, Math.min(dist, 400));
        dist = dist * 29 * 2;
        this.arduino.runner.getMicroEvent(this.microEventIndex).period = dist;
      }
    }, () => {
      tmp = this.control.attr();
    }, () => {
    });
    if (this.arduino) {
      const point = this.arduino.getPort(pinName);
      this.microEventIndex = this.arduino.runner.addMicroEvent({
        start: 0,
        state: false,
        period: 928,
        pin: point.pin,
        port: point.name,
        enable: true
      });
    }
  }
  /** Function removes all callbacks  */
  closeSimulation(): void {
    this.valueText.remove();
    this.Tline.remove();
    this.Rline.remove();
    this.control.remove();
    this.valueText = null;
    this.control = null;
    this.Tline = null;
    this.Rline = null;
  }
  simulate(): void {
  }
}
