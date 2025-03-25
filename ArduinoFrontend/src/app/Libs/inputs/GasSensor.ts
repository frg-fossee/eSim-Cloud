import { CircuitElement } from '../CircuitElement';
import { Collision, Vector } from './Collision';

/// TODO: Handle the digital pin
/**
 * Class GasSensor MQ2
 */
export class MQ2 extends CircuitElement {
  /**
   * Line which is drawn while simulation.
   */
  line: any;
  /**
   * Gas Sensor Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('MQ2', x, y, 'MQ2.json', canvas);
  }
  /**
   * Initialize Gas Sensor
   */
  init() {
    this.elements[1].hide();
    this.nodes[0].addValueListener((v) => {
      this.nodes[1].setValue(v, null);
    });
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
      title: 'Gas Sensor (MQ-2)'
    };
  }
  /**
   * Sets the analog value of the gas sensor based on the distance between tmp and cloud.
   * @param tmp The center of the cloud
   * @param Center The Center of the smoke detector
   */
  setValue(tmp: Vector, Center: Vector) {
    const dist = Collision.EuclideanDistance(tmp, Center);
    let v;
    if (dist <= 189) {
      v = ((189 - dist) / 189) * 5;
    } else {
      v = 0;
    }
    if (this.nodes[0].connectedTo && this.nodes[0].value >= 4.9 &&
      this.nodes[3].connectedTo && this.nodes[1].connectedTo) {
      this.nodes[3].setValue(Math.round(v), null);
    } else {
      window['showToast']('Please Connect Wires Properly');
    }
  }
  /**
   * Initialize animation for the  gas sensor
   */
  initSimulation(): void {
    // Check Connection
    if (
      !(this.nodes[0].connectedTo &&
        this.nodes[1].connectedTo &&
        this.nodes[3].connectedTo)
    ) {
      window['showToast']('Please Connect Sensor Properly');
    } else {
    this.elements[1].show();
    this.elements.undrag();
    let tmp = this.elements[1].attr();
    this.elements[1].attr({
      x: tmp.x + this.tx,
      y: tmp.y + this.ty,
      transform: 't0,0'
    });

    this.line = this.canvas.path(
      `M${tmp.x + this.tx + 145 + 19},${tmp.y + this.ty + 145}L${
      this.tx + this.x + 48
      },${
      this.ty + this.y + 50
      }`
    );

    this.line.attr({
      'stroke-dasharray': ['-.']
    });

    const Center: Vector = {
      x: this.tx + this.x + 48,
      y: this.ty + this.y + 50
    };
    // Add the drag listener to the cloud
    this.elements[1].drag((dx, dy) => {
      // Update Position
      this.elements[1].attr({
        x: tmp.x + dx,
        y: tmp.y + dy
      });
      // Set the analog value
      this.setValue({
        x: tmp.x + dx + 164,
        y: tmp.y + dy + 145
      }, Center);
      // Update the line
      this.line.attr({
        path: `M${Center.x},${Center.y},L${tmp.x + dx + 164},${tmp.y + dy + 145}`
      });
    }, () => {
      tmp = this.elements[1].attr();
    }, () => {
    });
    tmp = this.elements[1].attr();
    this.setValue({
      x: tmp.x + 164,
      y: tmp.y + 145
    }, Center);
  }

  }
  /**
   * Remove line and smoke
   */
  closeSimulation(): void {
    if (this.nodes[0].connectedTo && this.nodes[1].connectedTo && this.nodes[3].connectedTo) {
      this.elements[1].hide();
      this.line.remove();
      this.line = null;
      this.elements[1].undrag();
      this.setDragListeners();
    }
}
}
