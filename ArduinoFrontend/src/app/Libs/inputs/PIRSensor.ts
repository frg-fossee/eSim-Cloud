import { CircuitElement } from '../CircuitElement';
import { Collision } from './Collision';
import { isNull } from 'util';
/**
 * PIR Sensor class
 */
export class PIRSensor extends CircuitElement {
  /**
   * Curve points of sensor
   */
  static curve: number[][];
  /**
   * points of hand polygon
   */
  static handPoints: number[][];
  /**
   *  The backgound range of the sensor
   */
  range: any;
  /**
   * backCurve(path) of sensor
   */
  backCurve: string;
  /**
   * hand is a Raphael Element
   */
  hand: any;
  /**
   * Map of pin name to the circuit node.
   */
  pinNameMap: any = {};
  /**
   * pushbutton constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('PIRSensor', x, y, 'PIRSensor.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    PIRSensor.curve = this.data.curve;
    PIRSensor.handPoints = this.data.hand;
    this.backCurve = this.data.backCurve;
    this.data = null;
    // Create a mapping for node label to node
    for (const node of this.nodes) {
      this.pinNameMap[node.label] = node;
    }
    this.elements[1].hide();
    this.pinNameMap['VCC'].addValueListener((v) => {
      this.pinNameMap['GND'].setValue(v, null);
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
      body,
      title: 'PIR Sensor',
      id: this.id
    };
  }
  /**
   * Initialize Variable,callback and event caller when start simulation is pressed
   */
  initSimulation(): void {
    this.elements.undrag();
    this.elements.unmousedown();
    this.range = this.canvas.path(this.backCurve);
    this.range.attr({
      fill: 'rgba(0,0,255,0.1)',
      stroke: 'none'
    });
    this.elements[1].show(); // Show Hand
    this.range.translate(this.x + this.tx + 99, this.y + this.ty + 80);
    this.range.toBack();
    const tmpCurve = [];
    // Updates the points of the sensor ranging curve
    for (const x of PIRSensor.curve) {
      tmpCurve.push([x[0] + this.x + this.tx, x[1] + this.y + this.ty]);
    }
    // FOR: Visual of Curve
    // console.log(this.curve.length)
    // this.canvas.path(`M${tmpCurve[0][0]},${tmpCurve[0][1]}
    //   L${tmpCurve[1][0]},${tmpCurve[1][1]}
    //   L${tmpCurve[2][0]},${tmpCurve[2][1]}
    //   L${tmpCurve[3][0]},${tmpCurve[3][1]},
    //   L${tmpCurve[4][0]},${tmpCurve[4][1]},
    //   L${tmpCurve[5][0]},${tmpCurve[5][1]}
    //   z`);
    // console.log(this.elements[1].transform())
    const handIni = this.elements[1].transform();
    let handTX = handIni[0][1];
    let handTy = handIni[0][2];
    let handFdx = 0;
    let handFdy = 0;
    let ans = false;
    // let timeout = 0;
    // let idk = null;
    this.elements[1].drag((dx, dy) => {
      handFdx = dx;
      handFdy = dy;
      this.elements[1].transform(`t${handTX + dx},${handTy + dy}`);
      // let handPoints = [];
      ans = false;
      // to check collision between hand and affected region
      for (const vec of PIRSensor.handPoints) {
        // handPoints.push(
        //   [vec[0] + this.x + hand_tx + dx, vec[1] + this.y + hand_ty + dy]
        // )
        ans = ans || Collision.isPointInsidePolygon(
          tmpCurve,
          [vec[0] + this.x + handTX + dx, vec[1] + this.y + handTy + dy]
        );
      }
      // console.log(ans);
      // if VCC pin of sensor is connected and has a potential of 5 volts
      if (ans) {
        if (this.pinNameMap['VCC'].value > 0) {
          this.pinNameMap['SIGNAL'].setValue(5, null);
          // if (!isNull(timeout)) {
          // clearTimeout(timeout);
          // } else {
          // }
        }
      }

      // if (idk) {
      //   idk.remove();
      // }
      // idk = this.canvas.path(`M${handPoints[0][0]},${handPoints[0][1]}
      // L${handPoints[1][0]},${handPoints[1][1]}
      // L${handPoints[2][0]},${handPoints[2][1]}
      // L${handPoints[3][0]},${handPoints[3][1]},
      // L${handPoints[4][0]},${handPoints[4][1]},
      // L${handPoints[5][0]},${handPoints[5][1]}z`);
      // handPoints = null;
    }, () => {
      // console.log(hand_tx, hand_ty);
    }, () => {
      handTX += handFdx;
      handTy += handFdy;
      setTimeout(() => {
        this.pinNameMap['SIGNAL'].setValue(0, null);
      }, 1000);
    });
  }
  /** Function removes all events and callbacks  */
  closeSimulation(): void {
    if (this.range) {
      this.range.remove();
    }
    this.elements[1].undrag();
    this.elements[1].hide();
    this.setDragListeners();
    this.setClickListener(null);
  }
}
