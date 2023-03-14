import { CircuitElement } from '../CircuitElement';
import { BreadBoard, Resistor } from '../General';
import { Point } from '../Point';
import { ArduinoUno } from './Arduino';
/**
 * Declare window so that custom created function don't throw error
 */
declare var window;
/**
 * LED class
 */
export class LED extends CircuitElement {
  /**
   * Colors of LED
   */
  static colors: string[] = [];
  /**
   * color to be shown while glowing
   */
  static glowColors: string[] = [];
  /**
   * Name of Color of LED
   */
  static colorNames: string[] = [];
  /**
   * Internal resistance of LED in ohms
   */
  static internalResistance = 13;
  /**
   * Selectedindex wrt to color
   */
  selectedIndex = 0;
  /**
   * Voltage of PWM
   */
  voltage = 0;
  /**
   * PWM attached
   */
  pwmAttached = false;
  /**
   * Previous node value.
   */
  prev = -2;
  /**
   * Set to keep track of visited nodes
   */
  visitedNodesv2 = new Set();
  /**
   * Pin Name mapped to Pins
   */
  pinNamedMap: any = {};
  /**
   * If all nodes of element are connected or not
   */
  allNodesConnected = false;
  /**
   * Flag to check if logic function's recursion should be skipped
   */
  skipCheck = false;
  /**
   * Variable to store resistance of entire circuit
   * Internal resistance of LED by default set to 13
   */
  resistance: number = LED.internalResistance;
  /**
   * Stores visited resistors
   */
  visitedResistors = new Set();
  /**
   * Stores variable resistance from Potentiometer
   */
  variableResistance = 0;
  /**
   * LED constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('LED', x, y, 'LED.json', canvas);
  }
  /** Saves data of selected color wrt its index */
  SaveData() {
    return {
      color: this.selectedIndex
    };
  }
  /**
   * Function Called to Load data from saved object
   * @param data Saved Object
   */
  LoadData(data: any) {
    this.selectedIndex = data.data.color;
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    if (LED.glowColors.length === 0) {
      // LED
      // console.log(this.data);
      LED.colors = this.data.colors;
      LED.colorNames = this.data.colorNames;
      LED.glowColors = this.data.glowcolors;
    }
    this.data = null;
    // Add value Change Listener to Circuit nodes
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
    this.elements[0].attr({
      fill: LED.colors[this.selectedIndex]
    });
  }
  /**
   * fills color in the led
   * @param color color
   */
  fillColor(color) {
    this.elements[3].attr({ fill: color });
  }
  /** Simulation Logic */
  logic(val: number) {

    if (this.prev === val) {
      this.skipCheck = true;
    }
    let current = val / (this.resistance + this.variableResistance);
    const pin0Current = (this.nodes[0].value / (this.resistance + this.variableResistance));

    if (!this.allNodesConnected) {
      const arduinoEnd: any = this.getRecArduinov2(this.pinNamedMap['POSITIVE'], 'POSITIVE');
      const negativeEnd = this.getRecArduinov2(this.pinNamedMap['NEGATIVE'], 'NEGATIVE');
      if (negativeEnd && arduinoEnd) {
        if (negativeEnd.hasOwnProperty('label')) {
          if (negativeEnd.label === 'GND' || (negativeEnd.value === 0 && arduinoEnd.value > 0)) {
            this.allNodesConnected = true;
          }
        }
      }
    }
    // TODO: Run if PWM is not attached
    if (this.nodes[0].connectedTo && this.nodes[1].connectedTo) {
      if (!this.pwmAttached && this.allNodesConnected) {
        if (current > 0.03 || pin0Current > 0.03) {
          window.showToast('LED has burst');
          this.handleConnectionError();
        } else if (current >= 0.02 || pin0Current >= 0.02) {
          this.anim();
        } else if ((current > 0.012 && current < 0.02) || (pin0Current > 0.012)) {
          this.glowWithAlpha(current);
        } else {
          this.fillColor('none');
        }

        if (val >= 0 && !this.skipCheck) {
          this.prev = val;
          this.nodes[1].setValue(val, null);
        } else {
          this.skipCheck = false;
          return;
        }
      } else if (this.pwmAttached && this.allNodesConnected) {
        // TODO: Run if PWM is attached
        current = this.voltage / this.resistance;
        this.glowWithAlpha(current);

      }
    } else {
      // TODO: Show Toast
      this.handleConnectionError();
      window.showToast('LED is not Connected properly');
    }
  }
  /**
   * create color and add alpha to color
   */
  glowWithAlpha(current: number) {

    const minCurrent = 0.012;
    const maxCurrent = 0.02;
    const minOpacity = 2;
    const maxOpacity = 9;

    if (current < minCurrent) {
      return;
    }
    const color = `r(0.5, 0.5)${LED.glowColors[this.selectedIndex]}`;
    const split = color.split('-');
    let genColor = 'none';

    // Scalaing current values to range between 2-9
    const alpha = (((current - minCurrent) / (maxCurrent - minCurrent)) * (maxOpacity - minOpacity)) + minOpacity;

    genColor = `${split[0].substr(0, split[0].length - 2)}${alpha})-${split[1]}`;
    this.elements[3].attr({ fill: genColor });
  }
  /**
   * Handles connection error
   */
  handleConnectionError() {
    this.fillColor('none');
  }
  /** animation caller when start simulation is pressed */
  anim() {
    this.fillColor(`r(0.5, 0.5)${LED.glowColors[this.selectedIndex]}`);
  }
  /**
   * Get The Led Name
   */
  getName() {
    // TODO: Change Accordingly to Color
    return `LED Red`;
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
    const select = document.createElement('select');
    const label = document.createElement('label');
    label.innerText = 'LED Color';
    let tmp = '';
    for (const name of LED.colorNames) {
      tmp += `<option>${name}</option>`;
    }
    select.innerHTML = tmp;
    select.selectedIndex = this.selectedIndex;
    select.onchange = () => {
      this.elements[0].attr({
        fill: LED.colors[select.selectedIndex]
      });
      this.selectedIndex = select.selectedIndex;
    };
    body.append(label);
    body.append(select);
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'LED'
    };
  }

  /**
   * Called when start simulation.
   */
  initSimulation(): void {
    this.visitedNodesv2.clear();
    // Reset allNodesConnected to false
    this.allNodesConnected = false;
    const pwmPins = [3, 5, 6, 9, 10, 11];
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }

    // Getting resistance values from resistors in the circuit
    this.getRecResistance(this.pinNamedMap['POSITIVE'], 'POSITIVE');
    this.getRecResistance(this.pinNamedMap['NEGATIVE'], 'NEGATIVE');

    // Determine if Positive terminal of LED is attached to Arduino
    const arduinoEnd: any = this.getRecArduinov2(this.pinNamedMap['POSITIVE'], 'POSITIVE');
    // Determine if Negative terminal of LED is attached to Arduino
    const negativeEnd = this.getRecArduinov2(this.pinNamedMap['NEGATIVE'], 'NEGATIVE');

    // make allNodesConnected boolean true if negative is connected to GND
    if (negativeEnd) {
      if (negativeEnd.hasOwnProperty('label')) {
        if (negativeEnd.label === 'GND') {
          this.allNodesConnected = true;
        }
      }
    }
    // Check if nodes of LED are connected
    if (!negativeEnd || !arduinoEnd) {
      // TODO: Show Toast
      this.handleConnectionError();
      window.showToast('LED is not Connected properly');
    }

    // do not run addPwm if arduino is not connected
    if (!arduinoEnd) {
      return;
    }
    // Only add pwm if connected to a pwm pin in arduino
    if (arduinoEnd && pwmPins.indexOf(parseInt(arduinoEnd.label.substr(1), 10)) !== -1) {
      const arduino = arduinoEnd.parent;
      (arduino as ArduinoUno).addPWM(arduinoEnd, (v, p) => {
        // Calculate voltage of pwm pin
        this.voltage = v / 100;
        // If voltage is greater than 6: make PWM attached false
        if (this.voltage > 6 || this.voltage < 0) {
          this.pwmAttached = false;
        } else {
          this.pwmAttached = true;
        }
      });
    }

  }
  /** Function removes all the animations */
  closeSimulation(): void {
    this.prev = -2;
    this.fillColor('none');
    // reset PWM boolean & voltage = 0
    this.pwmAttached = false;
    this.voltage = 0;
    this.resistance = LED.internalResistance;
    this.visitedResistors.clear();
    this.variableResistance = 0;
  }
  /**
   * Returns ID
   */
  getID() {
    return this.id;
  }
  /**
   * Sets variable resitance
   */
  setVariableResistance(resistance: number) {
    this.variableResistance = resistance;
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
   * Return the node which is connected to arduino by recursively finding connected node
   * @param node The Node which need to be checked
   */
  getRecResistance(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'Resistor') {
        const resistorID = (node.connectedTo.start.parent as Resistor).getID();
        if (!this.visitedResistors.has(resistorID)) {
          this.resistance = this.resistance + (node.connectedTo.start.parent as Resistor).getResistance();
          this.visitedResistors.add(resistorID);
        }
      } else if (node.connectedTo.end.parent.keyName === 'Resistor') {
        const resistorID = (node.connectedTo.end.parent as Resistor).getID();
        if (!this.visitedResistors.has(resistorID)) {
          this.resistance = this.resistance + (node.connectedTo.end.parent as Resistor).getResistance();
          this.visitedResistors.add(resistorID);
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
        return this.getRecResistanceBread(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.end.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecResistanceBread(node, startedOn);
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
          return this.getRecResistance(node.connectedTo.end.parent.nodes[3], startedOn);
        } else if (startedOn === 'NEGATIVE') {
          // If search was started on Negative node then return connected node of GND in Relay
          return this.getRecResistance(node.connectedTo.end.parent.nodes[5], startedOn);
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
              return this.getRecResistance(node.connectedTo.end.parent.nodes[e], startedOn);
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
              return this.getRecResistance(node.connectedTo.start.parent.nodes[e], startedOn);
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
  private getRecResistanceBread(node: Point, startedOn: string) {
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
                return this.getRecResistance(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecResistance(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecResistance(bb.joined[e], startedOn);
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
                return this.getRecResistance(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecResistance(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecResistance(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    }
  }


}

/**
 * RGBLED class
 */
export class RGBLED extends CircuitElement {
  /**
   * Raphael Glow element
   */
  glow: any = null;
  /**
   * Set to keep track of visited nodes
   */
  visitedNodesv2 = new Set();
  /**
   * Check if RGB LED is properly connected
   */
  isProperlyConnected = false;
  /**
   * Connected pin of Cathode to Arduino
   */
  cathodePin = null;
  /**
   * RGBLED constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('RGBLED', x, y, 'RGBLED.json', canvas);
  }
  /**
   * Initialize RGB LED
   */
  init() {
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[2].addValueListener((v) => this.logic(v));
    this.nodes[3].addValueListener((v) => this.logic(v));
  }
  /**
   * Function for logic of value listener
   */
  logic(val: number) {
    let negativeEnd = null;
    if (!this.cathodePin) {
      negativeEnd = this.getRecArduinov2(this.nodes[1], 'CATHODE');
      this.cathodePin = negativeEnd;
    }

    if (this.cathodePin && !this.isProperlyConnected) {
      if (this.cathodePin.label === 'GND' || this.cathodePin.value === 0) {
        this.isProperlyConnected = true;
      }
    }

    if (this.isProperlyConnected) {
      this.nodes[1].setValue(val, this.nodes[0]);
      this.anim();
    }
  }
  /** animation caller when start simulation is pressed */
  anim() {
    if (this.glow) {
      this.glow.remove();
      this.glow = null;
    }
    // Simulation Logic
    let R = (this.nodes[0].value > 0) ? 255 : 0;
    let B = (this.nodes[2].value > 0) ? 255 : 0;
    let G = (this.nodes[3].value > 0) ? 255 : 0;
    if (R === 0 && G === 0 && B === 0) {
      this.elements[1].attr({
        fill: 'none'
      });
      return;
    }
    if (R === 255 && G === 255 && B === 255) {
      R = G = B = 209;
    }
    this.elements[1].attr({
      fill: `rgba(${R}, ${G}, ${B}, 0.8)`
    });
    this.glow = this.elements[1].glow({
      color: `rgb(${R}, ${G}, ${B})`
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
      title: 'RGB LED',
      body
    };
  }
  /**
   * Removes glow
   */
  removeGlow() {
    if (this.glow) {
      this.glow.remove();
      this.glow = null;
    }
  }
  /**
   * Handles connection error
   */
  handleConnectionError() {
    this.removeGlow();
  }
  /**
   * Called on start simulation
   */
  initSimulation(): void {
    const negativeEnd = this.getRecArduinov2(this.nodes[1], 'CATHODE');
    if (negativeEnd) {
      this.cathodePin = negativeEnd;
      if (negativeEnd.label === 'GND') {
        this.isProperlyConnected = true;
      }
    }

  }
  /**
   * Remove Glow and clear the filling
   */
  closeSimulation(): void {
    this.removeGlow();
    this.elements[1].attr({
      fill: 'none'
    });
    this.isProperlyConnected = false;
    this.cathodePin = null;
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
}
