import { CircuitElement } from '../CircuitElement';
import { Slider } from './Slider';
import { Point } from '../Point';
import { BreadBoard } from '../General';


declare var window;

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
  /**
   * Maximum temprature of Thermistor
   */
  maxVal = 500;
  /**
   * Resistor Value Ohms
   */
  resistorVal = 1;
  /**
   * Set of Visited Nodes
   */
  visitedNodesv2 = new Set();
  /**
   * Beta Value for calculation of output voltage. see below for more info
   * Values used for calculating beta
   * |------------------------------|
   * | Temprature  |   Resistance   |
   * |------------------------------|
   * |    273 K    |  32650.80 Ohms |
   * |    298 K    |  10000 Ohms    |
   * |------------------------------|
   * Formula(for beta) : ß=ln(R1/R2)/((1/T1)-(1/T2))
   */
  beta = Math.log(32650.80 / 10000) / ((1 / 273) - (1 / 298));

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
    // add text
    this.valueText = this.canvas.text(this.x + this.tx + 120, this.y + this.ty - 40, `${this.maxVal / 2} C`);
    this.valueText.attr({
      'font-size': 15
    });
    // create & add slider
    this.slide = new Slider(this.canvas, this.x + this.tx, this.y + this.ty - 10);
    this.slide.setGradient('#69644b', '#ffd500');

    // get value of resistor connected
    const resistorEnd1 = this.getRecResistor(this.nodes[0], 'Terminal 1');
    const resistorEnd2 = this.getRecResistor(this.nodes[1], 'Terminal 2');
    if (resistorEnd1) {
      // if resistor is connected to node[0] get value of resistor
      this.resistorVal = resistorEnd1.parent.value;
    } else if (resistorEnd2) {
      // if resistor is connected to node[1] get value of resistor
      this.resistorVal = resistorEnd2.parent.value;
    }
    // determine if incoming current is coming from node[0] or node[1]
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
    this.visitedNodesv2.clear();
  }
  /**
   * Call this function to change ouput value of photoresistor
   * @param enable1 Pin to direct output on
   * @param v value of slider, ranges from 0-1
   */
  changeVal(enable1, v) {
    // calculate temprature according slider
    const temp = v * this.maxVal;
    // calculate part of equation which is in power
    const pow = this.beta * ((1 / (273 + temp)) - (1 / 298));
    // calculate internal resistance of thermistor
    const r = 10000 * Math.pow(2.718, pow);
    // if enable1 is true
    if (enable1) {
      // calculate voltage value
      const incoming = this.nodes[1].value;
      // calculate output voltage
      const Vout = (this.resistorVal / (this.resistorVal + r)) * incoming;
      // set output voltage
      this.nodes[0].setValue(Vout, null);
      // update text
      this.valueText.attr({
        text: this.getValue(temp)
      });
    } else {
      // calculate voltage value
      const incoming = this.nodes[0].value;
      // calculate output voltage
      const Vout = (this.resistorVal / (this.resistorVal + r)) * incoming;
      // set output voltage
      this.nodes[1].setValue(Vout, null);
      // update text
      this.valueText.attr({
        text: this.getValue(temp)
      });

    }
  }

  /**
   * Returns node connected to Resistor
   * @param node node to start search on
   * @param startedOn label of node search started on
   * @returns Resistor connected Node
   */
  getRecResistor(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'Resistor') {
        // TODO: Return if L293D is connected to start node
        return node.connectedTo.start;
      } else if (node.connectedTo.end.parent.keyName === 'Resistor') {
        // TODO: Return if L293D is connected to end node
        return node.connectedTo.end;
      } else if (node.connectedTo.start.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.start.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecBread(node, startedOn);
      } else if (node.connectedTo.end.parent.keyName === 'BreadBoard' && !this.visitedNodesv2.has(node.connectedTo.end.gid)) {
        // TODO: Call recursive BreadBoard handler function if node is connected to Breadboard && visited nodes doesn't have node's gid
        return this.getRecBread(node, startedOn);
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
          return this.getRecResistor(node.connectedTo.end.parent.nodes[3], startedOn);
        } else if (startedOn === 'NEGATIVE') {
          // If search was started on Negative node then return connected node of GND in Relay
          return this.getRecResistor(node.connectedTo.end.parent.nodes[5], startedOn);
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
              // call back L293D Recursive Fn
              return this.getRecResistor(node.connectedTo.end.parent.nodes[e], startedOn);
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
              // call back L293D Recursive Fn
              return this.getRecResistor(node.connectedTo.start.parent.nodes[e], startedOn);
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
  getRecBread(node: Point, startedOn: string) {
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
                return this.getRecResistor(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecResistor(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecResistor(bb.joined[e], startedOn);
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
                return this.getRecResistor(bb.joined[e], startedOn);
              }
            } else if (ascii >= 102 && ascii <= 106) {
              if (bb.joined[e].isConnected() && (currAscii >= 102 && currAscii <= 106)) {
                return this.getRecResistor(bb.joined[e], startedOn);
              }
            } else {
              if (bb.joined[e].isConnected() && (bb.joined[e].label === node.connectedTo.end.label)) {
                return this.getRecResistor(bb.joined[e], startedOn);
              }
            }
          }
        }
      }
    }

  }

}
