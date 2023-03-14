import { CircuitElement } from '../CircuitElement';
import { BreadBoard } from '../General';
import { Vector } from './Collision';
import { Point } from '../Point';
import { LED } from '../outputs/Led';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Potentiometer Class
 */
export class Potentiometer extends CircuitElement {
  /**
   * Types of potentiometer name.
   */
  static variants: string[];
  /**
   * Types of potentiometer resistance
   */
  static variantsValue: number[];
  /**
   * Selected potentiometer type.
   */
  selectedIndex: number;
  /**
   * Arduino Pin connected to 0 of potentiometer
   */
  arduinoEndZero: any;
  /**
   * Arduino Pin connected to 2 of potentiometer
   */
  arduinoEndTwo: any;
  /**
   * Set to keep track of visited nodes
   */
  visitedNodesv2 = new Set();
  /**
   * Check the connection type
   */
  isRheostat: boolean = null;
  /**
   * Stores visited LEDs' ids
   */
  visitedLEDs = new Set();
  /**
   * Stores connected LEDs
   */
  connectedLEDs: LED[] = [];
  /**
   * Potentiometer constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('PotentioMeter', x, y, 'Potentiometer.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    Potentiometer.variants = this.data.variants;
    Potentiometer.variantsValue = this.data.value;
    this.data.value = [];
    this.data.variants = [];
    this.data = null;
  }
  /**
   * Returns the client point respective to the svg
   * @param x X positon
   * @param y y position
   */
  svgPoint(x, y) {
    const pt = window['holder_svg'].createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(window.canvas.canvas.getScreenCTM().inverse());
  }
  /**
   * Rotates the dial and sets the analog value
   * @param center Center of the Potentiometer
   * @param clientX Mouse X
   * @param clientY Mouse Y
   */
  rotateDial(center: Vector, clientX: number, clientY: number) {
    const point = this.svgPoint(clientX, clientY);
    const difX = point.x - center.x;
    const difY = point.y - center.y;
    let ang = Math.atan2(difY, difX);
    if (ang < 0) {
      ang += 2 * Math.PI;
    }
    // if(line){
    //   line.remove();
    //   line = null;
    // }
    // const ex = center.x + 100*Math.cos(ang);
    // const ey = center.y + 100*Math.sin(ang);
    // line = this.canvas.path(`M${center.x},${center.y}L${ex},${ey}`)
    ang *= (180 / Math.PI);
    ang = (ang + 225) % 360;
    if (ang > 268) {
      ang = 268;
    }
    let to;
    let intp = 0;
    // console.log(ang / 268);
    if (this.arduinoEndZero) {
      to = Math.max(
        this.nodes[0].value,
        this.nodes[1].value
      );
      intp = (ang / 268) * to;
    } else if (this.arduinoEndTwo) {
      to = Math.max(
        this.nodes[1].value,
        this.nodes[2].value
      );
      intp = to - ((ang / 268) * to);
    }
    if (to < 0) {
      window['showToast']('Potentiometer Not Connected');
      return;
    }
    this.elements[1].transform(`r${ang}`);

    this.nodes[1].setValue(intp, this.nodes[1]);
  }
  /**
   * Rotates the dial and sets the analog value for Rheostat connection
   * @param center Center of the Potentiometer
   * @param clientX Mouse X
   * @param clientY Mouse Y
   */
  rotateDialRheostat(center: Vector, clientX: number, clientY: number) {
    const point = this.svgPoint(clientX, clientY);
    const difX = point.x - center.x;
    const difY = point.y - center.y;
    const resistanceValue = Potentiometer.variantsValue[this.selectedIndex];

    let ang = Math.atan2(difY, difX);
    if (ang < 0) {
      ang += 2 * Math.PI;
    }
    // if(line){
    //   line.remove();
    //   line = null;
    // }
    // const ex = center.x + 100*Math.cos(ang);
    // const ey = center.y + 100*Math.sin(ang);
    // line = this.canvas.path(`M${center.x},${center.y}L${ex},${ey}`)
    ang *= (180 / Math.PI);
    ang = (ang + 225) % 360;
    if (ang > 268) {
      ang = 268;
    }
    let to;
    let calResistance = -1;
    const minVoltage = 0;
    const minLEDResistance = 100;
    const maxLEDResitance = 466;
    if (this.arduinoEndZero) {
      to = Math.max(
        this.nodes[0].value,
        this.nodes[1].value
      );
      // intp = (ang / 268) * to;
      calResistance = ((ang / 268) * resistanceValue);
      this.sendResistance(calResistance);
    } else if (this.arduinoEndTwo) {
      to = Math.max(
        this.nodes[1].value,
        this.nodes[2].value
      );
      calResistance = resistanceValue - ((ang / 268) * resistanceValue);
      this.sendResistance(calResistance);
    }
    if (to < 0) {
      window['showToast']('Potentiometer Not Connected');
      return;
    }
    this.elements[1].transform(`r${ang}`);
    this.nodes[1].setValue(to, this.nodes[1]);
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
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    const label = document.createElement('label');
    label.innerText = 'Resistance';
    const select = document.createElement('select');
    let tmp = '';
    for (const val of Potentiometer.variants) {
      tmp += `<option>${val} &#8486;</option>`;
    }
    select.innerHTML = tmp;
    select.selectedIndex = this.selectedIndex;
    select.onchange = () => {
      this.selectedIndex = select.selectedIndex;
    };
    body.append(label);
    body.append(select);
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Potentiometer',
      body
    };
  }
  /**
   * Called on start simulation. Add Event listener.
   */
  initSimulation(): void {

    if (!this.areNodesConnectedProperly()) {
      window.showToast('Potentiometer not connected properly.');
      return;
    }
    const attr = this.elements[1].attr();
    const center = {
      x: attr.x + attr.width / 2 + this.tx,
      y: attr.y + attr.height / 2 + this.ty
    };
    this.elements[1].transform(`t0,0`);
    this.elements[1].attr({
      x: attr.x + this.tx,
      y: attr.y + this.ty
    });
    this.elements.undrag();
    this.elements.unmousedown();

    if (!this.isRheostat) {
      this.elements.drag((_, __, mX, mY) => {
        this.rotateDial(center, mX, mY);
      }, (mX, mY) => {
        this.rotateDial(center, mX, mY);
      },
        (ev: MouseEvent) => {
          this.rotateDial(center, ev.clientX, ev.clientY);
        });
    } else {
      this.elements.drag((_, __, mX, mY) => {
        this.rotateDialRheostat(center, mX, mY);
      }, (mX, mY) => {
        this.rotateDialRheostat(center, mX, mY);
      },
        (ev: MouseEvent) => {
          this.rotateDialRheostat(center, ev.clientX, ev.clientY);
        });
    }

    // Find out the LEDs in the circuit
    this.getRecLED(this.nodes[0], 'Terminal 1');
    this.getRecLED(this.nodes[1], 'WIPER');
    this.getRecLED(this.nodes[2], 'Ternimal 2');

    // Get Arduino Connected ends for terminal 1 & terminal 2
    this.arduinoEndZero = this.getRecArduinov2(this.nodes[0], 'Terminal 1');
    this.arduinoEndTwo = this.getRecArduinov2(this.nodes[2], 'Terminal 2');
    if (this.arduinoEndZero) {
      // TODO : If arduino is connected to Terminal 1 of potentiometer
      // set WIPER value 0
      this.nodes[1].setValue(0, this.nodes[1]);
    } else if (this.arduinoEndTwo) {
      // TODO : If arduino is connected to Terminal 2 of potentiometer
      // set WIPER value as from Terminal 2
      this.nodes[1].setValue(this.nodes[2].value, this.nodes[1]);
    }
  }
  /**
   * Save the Selected type in database
   */
  SaveData() {
    return {
      value: this.selectedIndex
    };
  }
  /**
   * Load the Selected type.
   * @param data Saved Data
   */
  LoadData(data: any) {
    if (data.data && data.data.value > 0) {
      this.selectedIndex = data.data.value;
    } else {
      this.selectedIndex = 0;
    }
  }
  /**
   * Reset transformation add add event listeners.
   */
  closeSimulation(): void {
    const attr = this.elements[1].attr();
    this.elements[1].attr({
      x: attr.x - this.tx,
      y: attr.y - this.ty
    });
    this.elements[1].transform(`t${this.tx},${this.ty}`);
    this.elements.undrag();
    this.elements.unmousedown();
    this.setClickListener(null);
    this.setDragListeners();
    this.isRheostat = null;
    this.visitedLEDs.clear();
    this.connectedLEDs = [];
  }
  /**
   * Checks if nodes of Potentiometer are connected either as
   * 1. Rheostat: Wiper + Left Pin (or) Wiper + Right Pin
   * 2. Voltage divider: All pins
   */
  areNodesConnectedProperly() {
    if (this.nodes[0].isConnected() && this.nodes[1].isConnected() && this.nodes[2].isConnected()) {
      const leftNode = this.getRecArduinov2(this.nodes[0], 'Terminal 1');
      const rightNode = this.getRecArduinov2(this.nodes[2], 'Terminal 2');
      if (leftNode && rightNode) {
        if (leftNode.label === 'GND' && rightNode.value > 0) {
          this.isRheostat = false;
          return true;
        } else if (rightNode.label === 'GND' && leftNode.value > 0) {
          this.isRheostat = false;
          return true;
        }
      }
    }

    if (this.nodes[0].isConnected() && this.nodes[1].isConnected()) {
      this.isRheostat = true;
      return true;
    } else if (this.nodes[1].isConnected() && this.nodes[2].isConnected()) {
      this.isRheostat = true;
      return true;
    }
    return false;
  }
  /**
   * Function to transfer resistance to connected LEDs
   * ToDo: Function is hardcoded
   * ToDo: Make it work for other components
   */
  sendResistance(resistance: number) {
    for (const led of this.connectedLEDs) {
      led.setVariableResistance(resistance);
    }
  }
  /**
   * Return the node which is connected to arduino by recursively finding connected node
   * @param node The Node which need to be checked
   */
  getRecArduinov2(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to start node
        this.visitedNodesv2.clear();
        return node.connectedTo.start;
      } else if (node.connectedTo.end.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to end node
        this.visitedNodesv2.clear();
        return node.connectedTo.end;
      } else if (node.connectedTo.start.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.start.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecArduinoBreadv2(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.end.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecArduinoBreadv2(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'Battery9v' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to 9V Battery
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'CoinCell' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to Coin Cell
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'RelayModule') {
        // TODO: Handle RelayModule
        if (startedOn === 'POSITIVE') {
          // If search was started on Positive node then return connected node of VCC in Relay
          return this.getRecArduinov2(node.connectedTo.end.parent.nodes[3], startedOn);
        } else if (startedOn === 'NEGATIVE') {
          // If search was started on Negative node then return connected node of GND in Relay
          return this.getRecArduinov2(node.connectedTo.end.parent.nodes[5], startedOn);
        }
      } else {
        // TODO: If nothing matches
        // IF/ELSE: Determine if start is to be used OR end for further recursion
        if (node.connectedTo.end.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.end.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.end.parent.nodes[e].gid !== node.connectedTo.end.gid
              && !this.visitedNodesv2.has(node.connectedTo.end.parent.nodes[e].gid) && node.connectedTo.end.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.end.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecArduinov2(node.connectedTo.end.parent.nodes[e], startedOn);
            }
          }
        } else if (node.connectedTo.start.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.start.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.start.parent.nodes[e].gid !== node.connectedTo.start.gid
              && !this.visitedNodesv2.has(node.connectedTo.start.parent.nodes[e].gid)
              && node.connectedTo.start.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.start.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecArduinov2(node.connectedTo.start.parent.nodes[e], startedOn);
            }
          }
        }

      }
    } catch (e) {
      console.warn(e);
      return false;
    }

  }

  /**
   * Recursive Function to handle BreadBoard
   * @param node Node which is to be checked for BreadBoard
   */
  private getRecArduinoBreadv2(node: Point, startedOn: string) {
    // IF/ELSE: Determine if start is to be used OR end for further recursion
    if (node.connectedTo.end.gid !== node.gid) {
      const bb = (node.connectedTo.end.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.end.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.end.label.substring(1, node.connectedTo.end.label.length)) {
            const ascii = node.connectedTo.end.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    } else if (node.connectedTo.start.gid !== node.gid) {
      const bb = (node.connectedTo.start.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.start.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.start.label.substring(1, node.connectedTo.start.label.length)) {
            const ascii = node.connectedTo.start.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecArduinov2(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Return the node which is connected to arduino by recursively finding LEDs inside the circuit
   * @param node The Node which need to be checked
   */
  getRecLED(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'LED') {
        const led = (node.connectedTo.start.parent as LED);
        if (!this.visitedLEDs.has(led.getID())) {
          this.connectedLEDs.push(led);
          this.visitedLEDs.add(led.getID());
        }
      } else if (node.connectedTo.end.parent.keyName === 'LED') {
        const led = (node.connectedTo.end.parent as LED);
        if (!this.visitedLEDs.has(led.getID())) {
          this.connectedLEDs.push(led);
          this.visitedLEDs.add(led.getID());
        }
      }
      if (node.connectedTo.start.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to start node
        this.visitedNodesv2.clear();
        return node.connectedTo.start;
      } else if (node.connectedTo.end.parent.keyName === 'ArduinoUno') {
        // TODO: Return if arduino is connected to end node
        this.visitedNodesv2.clear();
        return node.connectedTo.end;
      } else if (node.connectedTo.start.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.start.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecLEDBread(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.end.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecLEDBread(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'Battery9v' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to 9V Battery
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'CoinCell' && window.scope.ArduinoUno.length === 0) {
        // TODO: Return false if node's end is connected to Coin Cell
        return false;
      } else if (node.connectedTo.end.parent.keyName === 'RelayModule') {
        // TODO: Handle RelayModule
        if (startedOn === 'POSITIVE') {
          // If search was started on Positive node then return connected node of VCC in Relay
          return this.getRecLED(node.connectedTo.end.parent.nodes[3], startedOn);
        } else if (startedOn === 'NEGATIVE') {
          // If search was started on Negative node then return connected node of GND in Relay
          return this.getRecLED(node.connectedTo.end.parent.nodes[5], startedOn);
        }
      } else {
        // TODO: If nothing matches
        // IF/ELSE: Determine if start is to be used OR end for further recursion
        if (node.connectedTo.end.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.end.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.end.parent.nodes[e].gid !== node.connectedTo.end.gid
              && !this.visitedNodesv2.has(node.connectedTo.end.parent.nodes[e].gid) && node.connectedTo.end.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.end.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecLED(node.connectedTo.end.parent.nodes[e], startedOn);
            }
          }
        } else if (node.connectedTo.start.gid !== node.gid) {
          // Loops through all nodes in parent
          for (const e in node.connectedTo.start.parent.nodes) {
            // IF: gid is different && gid not in visited node
            if (node.connectedTo.start.parent.nodes[e].gid !== node.connectedTo.start.gid
              && !this.visitedNodesv2.has(node.connectedTo.start.parent.nodes[e].gid)
              && node.connectedTo.start.parent.nodes[e].isConnected()) {
              // add gid in visited nodes
              this.visitedNodesv2.add(node.connectedTo.start.parent.nodes[e].gid);
              // call back Arduino Recursive Fn
              return this.getRecLED(node.connectedTo.start.parent.nodes[e], startedOn);
            }
          }
        }
      }
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  /**
   * Recursive Function to handle BreadBoard
   * @param node Node which is to be checked for BreadBoard
   */
  private getRecLEDBread(node: Point, startedOn: string) {
    // IF/ELSE: Determine if start is to be used OR end for further recursion
    if (node.connectedTo.end.gid !== node.gid) {
      const bb = (node.connectedTo.end.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.end.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.end.label.substring(1, node.connectedTo.end.label.length)) {
            const ascii = node.connectedTo.end.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    } else if (node.connectedTo.start.gid !== node.gid) {
      const bb = (node.connectedTo.start.parent as BreadBoard);
      // loop through joined nodes of breadboard
      for (const e in bb.joined) {
        if (bb.joined[e].gid !== node.connectedTo.start.gid) {
          // Run only if substring matches
          if (bb.joined[e].label.substring(1, bb.joined[e].label.length)
            === node.connectedTo.start.label.substring(1, node.connectedTo.start.label.length)) {
            const ascii = node.connectedTo.start.label.charCodeAt(0);
            const currAscii = bb.joined[e].label.charCodeAt(0);
            // add gid to VisitedNode
            this.visitedNodesv2.add(bb.joined[e].gid);
            // IF/ELSE: determine which part of breadboard is connected
            if (ascii >= 97 && ascii <= 101) {
              if (bb.joined[e].isConnected() && (currAscii >= 97 && currAscii <= 101)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecLED(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    }
  }
}
