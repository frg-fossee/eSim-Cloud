import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { ArduinoUno } from '../outputs/Arduino';
import { BreadBoard } from '../General';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Buzzer Class
 */
export class Buzzer extends CircuitElement {
  /**
   * Map pin name to the circuit node
   */
  pinNamedMap: any = {};
  /**
   * The oscillator for buzzer.
   */
  oscillator: any;
  /**
   * The Arduino uno which is connected to the Buzzer.
   */
  arduino: ArduinoUno;
  /**
   * Audio Context
   */
  audioCtx: AudioContext;
  /**
   * Toggle for wether buzzer is beeping or not.
   */
  sound = false;
  /**
   * Id for setInterval hook.
   */
  setIntervId: any;
  /**
   * Set to keep track of visited nodes
   */
  visitedNodesv2 = new Set();
  /**
   * Keep track of previous value
   */
  prev = -2;
  /**
   * Flag to check if logic function's recursion should be skipped
   */
  skipCheck = false;
  /**
   * If all nodes of element are connected or not
   */
  allNodesConnected = false;

  /**
   * pushbutton constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(private canvas: any, public x: number, public y: number) {
    super('Buzzer', x, y, 'Buzzer.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // console.log(this.nodes[0].label);
    // console.log(this.nodes[1].label);
    for (const x of this.nodes) {
      this.pinNamedMap[x.label] = x;
    }
    this.nodes[0].addValueListener((v) => this.logic(v));
    this.nodes[1].addValueListener((v) => this.logic(v));
  }
  /**
   * Logic for beeping sound
   * @param val The Value on the positive pin
   */
  logic(val: number) {
    // TODO: Handle PWM
    if (this.prev === val) {
      this.skipCheck = true;
    }

    if (!this.allNodesConnected) {
      const arduinoEnd: any = this.getRecArduinov2(this.pinNamedMap['POSITIVE'], 'POSITIVE');
      const negativeEnd = this.getRecArduinov2(this.pinNamedMap['Negative'], 'Negative');
      if (arduinoEnd && negativeEnd) {
        if (negativeEnd.hasOwnProperty('label')) {
          if (negativeEnd.label === 'GND' || (negativeEnd.value === 0 && arduinoEnd.value > 0)) {
            this.allNodesConnected = true;
          }
        }
      }
    }

    if (this.nodes[0].isConnected() && this.nodes[1].isConnected()) {
      if (this.allNodesConnected) {
        if (val === 5 || this.nodes[0].value === 5) {
          if (this.oscillator && !this.sound) {
            this.oscillator.connect(this.audioCtx.destination);
            this.sound = true;
          }
        } else {
          if (this.oscillator && this.sound) {
            this.oscillator.disconnect(this.audioCtx.destination);
            this.sound = false;
          }
        }
        if (val >= 0 && !this.skipCheck) {
          this.prev = val;
          this.nodes[1].setValue(val, null);
        } else {
          this.skipCheck = false;
          return;
        }
      }
    } else {
      // TODO: Show Toast
      window.showToast('Buzzer is not Connected properly');
    }
  }
  /**
   * returns properties object
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties() {
    const body = document.createElement('div');
    return {
      title: 'Buzzer',
      keyName: this.keyName,
      id: this.id,
      body
    };
  }
  /**
   * Initialize Variable and callback when start simulation is pressed
   */
  initSimulation() {
    this.allNodesConnected = false;
    this.visitedNodesv2.clear();

    const arduinoEnd: any = this.getRecArduinov2(this.pinNamedMap['POSITIVE'], 'POSITIVE');
    const negativeEnd = this.getRecArduinov2(this.pinNamedMap['Negative'], 'Negative');

    // make allNodesConnected boolean true if negative is connected to GND
    if (negativeEnd) {
      if (negativeEnd.hasOwnProperty('label')) {
        if (negativeEnd.label === 'GND') {
          this.allNodesConnected = true;
        }
      }
    }
    // Show error
    if (!arduinoEnd || !negativeEnd) {
      window.showToast('Buzzer is not Connected properly');
      return;
    }

    if (arduinoEnd) {
      if (arduinoEnd.connectedTo) {
        this.arduino = arduinoEnd.parent;
      }
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'square';
    this.oscillator.frequency.value = 2300;
    const prescaler = [8, 32, 64, 128, 256, 1024];
    this.setIntervId = setInterval(() => {
      try {
        const tccr2b = this.arduino.runner.timer2.TCCRB;
        const ocr2a = this.arduino.runner.timer2.ocrA;
        if (ocr2a !== 0) {
          this.oscillator.frequency.value = Math.round(16000000 / (2 * prescaler[tccr2b - 2] * (ocr2a + 1)));
        }
      } catch (error) {
      }
    }, 10);
    this.oscillator.start();
  }
  /** Function removes all callbacks  */
  closeSimulation() {
    if (this.oscillator && this.sound) {
      this.oscillator.disconnect(this.audioCtx.destination);
      this.sound = false;
    }
    this.audioCtx = null;
    this.oscillator = null;
    this.arduino = null;
    this.prev = -2;
    this.skipCheck = false;
    setTimeout(() => {
      clearInterval(this.setIntervId);
    }, 100);
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
