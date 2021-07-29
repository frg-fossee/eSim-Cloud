import { CircuitElement } from '../CircuitElement';
import { ArduinoUno } from './Arduino';
import { Point } from '../Point';
import { BreadBoard } from '../General';

/**
 * Declare Raphael so that build don't throws error
 */
declare var Raphael;

declare var window;

/**
 * Motor class
 */
export class Motor extends CircuitElement {
  /**
   * The Direction of motor +1 => Clockwise, -1 => Anticlockwise
   */
  private dirn = 1;
  /**
   * The Center X of the motor.
   */
  cx = 0;
  /**
   * Center Y of the motor.
   */
  cy = 0;
  /**
   * RPM of the motor.
   */
  rpm: any;
  /**
   * if PWM is attached
   */
  pwmAttached = false;
  /**
   * Voltage
   */
  voltage = -1;
  /**
   * Previous voltage
   */
  prevVoltage = -1;
  /**
   * set of Visited nodes
   */
  visitedNodesv2 = new Set();


  /**
   * Motor constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('Motor', x, y, 'Motor.json', canvas);
  }

  // 6v -> 9000rpm ->
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // Add value change Listener to circuit node
    this.nodes[0].addValueListener((v, cby, par) => {
      if (cby === this.nodes[1]) {
        return;
      }
      // sets the value for node
      this.nodes[1].setValue(v, this.nodes[0]);
      this.dirn = -1;
      if (v < 0) {
        this.elements[1].stop();
      } else if (v === 0) {
        if (this.rpm && !this.pwmAttached) {
          this.rpm.remove();
          this.rpm = null;
        }
        this.elements[1].stop();
      } else {
        if (this.rpm && this.voltage !== this.prevVoltage) {
          // TODO: remove animation
          this.rpm.remove();
          this.rpm = null;
        }
        // stop animation
        this.elements[1].stop();
        if (v === 0) {
          return;
        }
        if (!this.pwmAttached) {
          // TODO: create animation using v if pwm is not attached
          if (this.rpm) {
            // TODO: remove animation
            this.rpm.remove();
            this.rpm = null;
          }
          this.setAnimation(v, 'AntiClockwise');
        } else {
          // TODO: create animation using voltage if pwm is attached
          if (this.voltage !== this.prevVoltage) {
            this.setAnimation(this.voltage, 'AntiClockwise');
            // update previous voltage variable
            this.prevVoltage = this.voltage;
          }
        }
      }
    });
    // Add value change Listener to circuit node
    this.nodes[1].addValueListener((v, cby, par) => {
      if (cby === this.nodes[0]) {
        return;
      }
      // sets the value for node
      this.nodes[0].setValue(v, this.nodes[1]);
      if (v < 0) {
        this.elements[1].stop();
      } else if (v === 0) {
        if (this.rpm && !this.pwmAttached) {
          this.rpm.remove();
          this.rpm = null;
        }
        this.elements[1].stop();
      } else {
        if (this.rpm && this.voltage !== this.prevVoltage) {
          // TODO: remove animation
          this.rpm.remove();
          this.rpm = null;
        }
        // stop animation
        this.elements[1].stop();
        if (v === 0) {
          return;
        }
        if (!this.pwmAttached) {
          // TODO: create animation using v if pwm is not attached
          if (this.rpm) {
            // TODO: remove animation
            this.rpm.remove();
            this.rpm = null;
          }
          this.setAnimation(v, 'Clockwise');
        } else {
          // TODO: create animation using voltage if pwm is attached
          if (this.voltage <= 0 && this.rpm) {
            this.rpm.remove();
            this.rpm = null;
            // update previous voltage variable
            this.prevVoltage = this.voltage;
          }
          if (this.voltage !== this.prevVoltage && this.voltage <= 6) {
            this.setAnimation(this.voltage, 'Clockwise');
            // update previous voltage variable
            this.prevVoltage = this.voltage;
          }
        }
      }
    });
  }

  /**
   * Use this function to rotate motor
   * @param volt Voltage Supplied to motor
   * @param direction Direction to rotate in
   */
  setAnimation(volt, direction) {
    const anim = Raphael.animation({ transform: `r360` }, 400 / volt);
    this.elements[1].animate(anim.repeat(Infinity));
    this.rpm = this.canvas.text(this.x + this.tx, this.y + this.ty - 30, `${Math.floor(1500 * volt)}RPM\n${direction}`);
    this.rpm.attr({
      'font-size': 15,
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
      body,
      title: 'Motor'
    };
  }
  /**
   * Initialize Variable,callback and animation caller when start simulation is pressed
   */
  initSimulation(): void {
    if (
      this.nodes[1].connectedTo &&
      (this.nodes[1].connectedTo.start &&
        this.nodes[1].connectedTo.start.parent.keyName === 'ArduinoUno')
      ||
      (this.nodes[1].connectedTo.end &&
        this.nodes[1].connectedTo.end.parent.keyName === 'ArduinoUno')
    ) {
      window['showToast']('The Motor Draws more current then Arduino could supply');
    }
    this.elements.undrag();
    const ok = this.elements[1].attr();
    this.cx = (ok.width / 2) + ok.x;
    this.cy = (ok.height / 2) + ok.y;
    this.elements[1].attr({
      transform: '',
      x: ok.x + this.tx,
      y: ok.y + this.ty
    });

    // determine recursively if positive pin is connected to L293D driver
    const posPin = this.getRecArduinov2(this.nodes[1], 'Positive');
    // determine recursively if negative pin is connected to L293D driver
    const negPin = this.getRecArduinov2(this.nodes[0], 'Negative');

    // Arduino pins that support PWM
    const pwmPins = [3, 5, 6, 9, 10, 11];

    // if negPin or posPin are connected to L293D
    if (negPin || posPin) {

      let inArduino1;
      let inArduino2;

      // Clear visitedNodesv2 set
      BreadBoard.visitedNodesv2.clear();
      // determine if OUT pins are connected to Arduino or not to positive
      if (posPin.label === 'OUT3') {
        inArduino1 = BreadBoard.getRecArduinov2(posPin.parent.nodes[6], 'IN3');
      } else if (posPin.label === 'OUT4') {
        inArduino1 = BreadBoard.getRecArduinov2(posPin.parent.nodes[1], 'IN4');
      } else if (posPin.label === 'OUT1') {
        inArduino1 = BreadBoard.getRecArduinov2(posPin.parent.nodes[9], 'IN1');
      } else if (posPin.label === 'OUT2') {
        inArduino1 = BreadBoard.getRecArduinov2(posPin.parent.nodes[14], 'IN2');
      }

      // Clear visitedNodesv2 set
      BreadBoard.visitedNodesv2.clear();
      // determine if OUT pins are connected to Arduino or not to negative
      if (negPin.label === 'OUT3') {
        inArduino2 = BreadBoard.getRecArduinov2(negPin.parent.nodes[6], 'IN3');
      } else if (negPin.label === 'OUT4') {
        inArduino2 = BreadBoard.getRecArduinov2(negPin.parent.nodes[1], 'IN4');
      } else if (negPin.label === 'OUT1') {
        inArduino2 = BreadBoard.getRecArduinov2(posPin.parent.nodes[9], 'IN1');
      } else if (negPin.label === 'OUT2') {
        inArduino2 = BreadBoard.getRecArduinov2(posPin.parent.nodes[14], 'IN2');
      }

      if (inArduino1) {
        // TODO: add PWM if PWM pin
        if (inArduino1 && pwmPins.indexOf(parseInt(inArduino1.label.substr(1), 10)) !== -1) {
          // TODO: add PWM if positive is PWM
          this.addPwmArduino(inArduino1.parent, inArduino1);
        }
      }
      if (inArduino2) {
        // TODO: add PWM if PWM pin
        if (inArduino2 && pwmPins.indexOf(parseInt(inArduino2.label.substr(1), 10)) !== -1) {
          // TODO: add PWM if positive is PWM
          this.addPwmArduino(inArduino2.parent, inArduino2);
        }
      }
      // return to stop the function here
      return;
    }
    // Prep PWM

    const arduinoEnd: any = BreadBoard.getRecArduinov2(this.nodes[1], 'Positive');
    const arduinoEndNegative: any = BreadBoard.getRecArduinov2(this.nodes[0], 'Negative');

    // do not run addPwm if arduino is not connected
    if (!arduinoEnd || !arduinoEndNegative) {
      return;
    }

    // Only add pwm if connected to a pwm pin in arduino
    if (arduinoEnd && pwmPins.indexOf(parseInt(arduinoEnd.label.substr(1), 10)) !== -1) {
      // TODO: add PWM if positive is PWM
      this.addPwmArduino(arduinoEnd.parent, arduinoEnd);
    } else if (arduinoEndNegative && pwmPins.indexOf(parseInt(arduinoEndNegative.label.substr(1), 10)) !== -1) {
      // TODO: add PWM if negative is PWM
      this.addPwmArduino(arduinoEndNegative.parent, arduinoEndNegative);
    } else {
      this.pwmAttached = false;
    }

  }

  /**
   * Use this function to add PWM to any node of Arduino
   * @param arduino Arduino instance
   * @param end Node to be enabled with PWM
   */
  addPwmArduino(arduino, end) {
    (arduino as ArduinoUno).addPWM(end, (v, p) => {
      // Calculate voltage of pwm pin
      this.voltage = v / 100;
      // If voltage is greater than 6: make PWM attached false
      if (this.voltage > 6 || this.voltage < 0) {
        this.pwmAttached = false;
        this.voltage = -1;
      } else {
        this.pwmAttached = true;
      }

    });
  }

  /** Function removes all  animations and callbacks  */
  closeSimulation(): void {
    this.elements[1].stop();
    const ok = this.elements[1].attr();
    this.elements[1].attr({
      transform: `t${this.tx},${this.ty}`,
      x: ok.x - this.tx,
      y: ok.y - this.ty
    });
    if (this.rpm) {
      this.rpm.remove();
      this.rpm = null;
    }
    this.setDragListeners();

    this.pwmAttached = false;
    this.voltage = -1;
    this.prevVoltage = -1;
    this.visitedNodesv2.clear();
  }

  /**
   * Returns node connected to L293D
   * @param node node to start search on
   * @param startedOn label of node search started on
   * @returns L293D connected Node
   */
  getRecArduinov2(node: Point, startedOn: string) {
    try {
      if (node.connectedTo.start.parent.keyName === 'L293D') {
        // TODO: Return if L293D is connected to start node
        return node.connectedTo.start;
      } else if (node.connectedTo.end.parent.keyName === 'L293D') {
        // TODO: Return if L293D is connected to end node
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
              // call back L293D Recursive Fn
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
              // call back L293D Recursive Fn
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
  getRecArduinoBreadv2(node: Point, startedOn: string) {
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

/**
 * MotorDriver L298N class
 */
export class L298N extends CircuitElement {
  /**
   * Pin Name mapped to Pins
   */
  pinNamedMap: any = {};
  /**
   * Speed of Motor A in range of 0 to 5.
   */
  speedA = 5;
  /**
   * Speed of Motor B in range of 0 to 5
   */
  speedB = 5;
  /**
   * Previous values of the pins.
   */
  prevValues: any = {
    IN1: -1,
    IN2: -1,
    IN3: -1,
    IN4: -1
  };

  /**
   * MotorDriver L298N constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('L298N', x, y, 'L298N.json', canvas);
  }
  /**
   * Initialize motor class.
   */
  init() {
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }
    this.pinNamedMap['V IN'].addValueListener(v => {
      this.pinNamedMap['GND'].setValue(v, this.pinNamedMap['GND']);
      if (v >= 5) {
        this.pinNamedMap['5V IN'].setValue(5, this.pinNamedMap['5V IN']);
      }
      this.update();
    });

    this.pinNamedMap['IN1'].addValueListener(v => {
      if (v !== this.prevValues.IN1) {
        this.prevValues.IN1 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN2'].addValueListener(v => {
      if (v !== this.prevValues.IN2) {
        this.prevValues.IN2 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN3'].addValueListener(v => {
      if (v !== this.prevValues.IN3) {
        this.prevValues.IN3 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN4'].addValueListener(v => {
      if (v !== this.prevValues.IN4) {
        this.prevValues.IN4 = v;
        this.update();
      }
    });
  }
  /**
   * Simulation Logic For L298N motor driver
   */
  update() {
    setTimeout(() => {
      if (this.pinNamedMap['IN1'].value > 0 && this.pinNamedMap['IN2'].value > 0) {
        window['showToast']('Both IN1 and IN2 Pins are High!');
        return;
      }

      if (this.pinNamedMap['IN3'].value > 0 && this.pinNamedMap['IN4'].value > 0) {
        window['showToast']('Both IN3 and IN4 Pins are High!');
        return;
      }
    }, 100);

    if (this.pinNamedMap['IN1'].value > 0) {
      this.pinNamedMap['Terminal 2'].setValue(
        this.pinNamedMap['V IN'].value * (this.speedA / 5),
        this.pinNamedMap['Terminal 2']
      );
    } else if (this.pinNamedMap['IN2'].value > 0) {
      this.pinNamedMap['Terminal 1'].setValue(
        this.pinNamedMap['V IN'].value * (this.speedA / 5),
        this.pinNamedMap['Terminal 1']
      );
    } else {
      this.pinNamedMap['Terminal 1'].setValue(
        0,
        this.pinNamedMap['Terminal 1']
      );
    }

    if (this.pinNamedMap['IN3'].value > 0) {
      this.pinNamedMap['Terminal 4'].setValue(
        this.pinNamedMap['V IN'].value * (this.speedB / 5),
        this.pinNamedMap['Terminal 4']
      );
    } else if (this.pinNamedMap['IN4'].value > 0) {
      this.pinNamedMap['Terminal 3'].setValue(
        this.pinNamedMap['V IN'].value * (this.speedB / 5),
        this.pinNamedMap['Terminal 3']
      );
    } else {
      this.pinNamedMap['Terminal 3'].setValue(
        0,
        this.pinNamedMap['Terminal 3']
      );
    }
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
    body.innerText = 'If you Don\'t Connect The ENA and ENB Pins it automatically connects to the 5V suppy';
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor Driver (L298N)'
    };
  }
  /**
   * Return the node which is connected to arduino
   * @param node The Node which need to be checked
   */
  private getArduino(node: Point) {
    if (
      node.connectedTo &&
      node.connectedTo.start &&
      node.connectedTo.start.parent.keyName === 'ArduinoUno'
    ) {
      return node.connectedTo.start;
    }
    if (
      node.connectedTo &&
      node.connectedTo.end &&
      node.connectedTo.end.parent.keyName === 'ArduinoUno'
    ) {
      return node.connectedTo.end;
    }
    return null;
  }
  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
    const arduinoEnd: any = this.getArduino(this.pinNamedMap['ENB']);
    if (arduinoEnd) {
      const arduino = arduinoEnd.parent;
      (arduino as ArduinoUno).addPWM(arduinoEnd, (v, p) => {
        this.speedA = v / 100;
        this.update();
      });
    }

    const arduinoEnd1: any = this.getArduino(this.pinNamedMap['ENA']);
    if (arduinoEnd1) {
      const arduino = arduinoEnd1.parent;
      (arduino as ArduinoUno).addPWM(arduinoEnd1, (v, p) => {
        this.speedB = v / 100;
        this.update();
      });
    }

  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
    this.pinNamedMap['IN1'].value = -1;
    this.pinNamedMap['IN2'].value = -1;
    this.pinNamedMap['IN3'].value = -1;
    this.pinNamedMap['IN4'].value = -1;
    this.speedA = 5;
    this.speedB = 5;
    this.prevValues = {
      IN1: -1,
      IN2: -1,
      IN3: -1,
      IN4: -1
    };
  }
}


/**
 * Servo Motor class
 */
export class ServoMotor extends CircuitElement {
  /**
   * Variable to state if servo is connected properly or not.
   */
  connected = true;
  /**
   * The Connected Arduino
   */
  arduino: CircuitElement = null;

  /**
   * MotorDriver L298N constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('ServoMotor', x, y, 'ServoMotor.json', canvas);
  }
  /**
   * Initializ Servo Motor
   */
  init() {
    this.nodes[1].addValueListener((v) => {
      if (v < 4 || v > 6) {
        window['showToast']('Low Voltage Applied');
      }
      this.nodes[0].setValue(v, this.nodes[1]);
    });
  }
  /**
   * Animate rotation of the shaft.
   * @param angle The Angle of the shaft
   * @param duration How much time it takes it to move
   */
  animate(angle: number, duration: number = 10) {
    const anim = Raphael.animation({ transform: `r${angle}` }, duration);
    this.elements[1].animate(anim);
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
      body,
      title: 'Servo Motor'
    };
  }
  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
    // Check Connection
    if (!(
      this.nodes[0].connectedTo &&
      this.nodes[1].connectedTo &&
      this.nodes[2].connectedTo
    )
    ) {
      window['showToast']('Please Connect Servo Properly!');
      this.connected = false;
      return;
    }

    // Get the Pin Which is connected to arduino
    let connectedPin = null;
    if (this.nodes[2].connectedTo.start
      && this.nodes[2].connectedTo.start.parent.keyName === 'ArduinoUno') {
      this.arduino = this.nodes[2].connectedTo.start.parent;
      connectedPin = this.nodes[2].connectedTo.start;
    }

    if (this.arduino === null &&
      this.nodes[2].connectedTo.end &&
      this.nodes[2].connectedTo.end.parent.keyName === 'ArduinoUno'
    ) {
      connectedPin = this.nodes[2].connectedTo.end;
      this.arduino = this.nodes[2].connectedTo.end.parent;
    } else {
      window['showToast']('Arduino Not Found!');
      this.connected = false;
      return;
    }


    this.connected = true;
    this.elements.undrag();
    const ok = this.elements[1].attr();
    this.elements[1].attr({
      transform: '',
      x: ok.x + this.tx,
      y: ok.y + this.ty
    });

    // Add a Servo event on arduino
    (this.arduino as ArduinoUno).addServo(connectedPin, (angle, prev) => {
      if (angle > 182) {
        return;
      }
      const duration = Math.abs(angle - (prev > 0 ? prev : 0)) * 5;
      this.animate(angle, duration);
    });
  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
    if (!this.connected) {
      return;
    }
    this.arduino = null;
    this.elements[1].stop();
    const ok = this.elements[1].attr();
    this.elements[1].attr({
      transform: `t${this.tx},${this.ty}`,
      x: ok.x - this.tx,
      y: ok.y - this.ty
    });
    this.setDragListeners();
  }
}
