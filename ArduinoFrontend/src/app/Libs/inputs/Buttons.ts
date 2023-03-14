import { CircuitElement } from '../CircuitElement';
import { BreadBoard } from '../General';
import { Point } from '../Point';

/**
 * Declare Raphael so that build don't throws error
 */
declare var Raphael;

declare var window;
/**
 * Pushbutton Class
 */
export class PushButton extends CircuitElement {
  /**
   * Map of Pin name to the circuit node
   */
  pinNamedMap: any = {};
  /**
   * Object of terminals and their respective arduino pin
   */
  terminalParent = {};
  parentList = new Set();
  /**
   * Set of Visited Nodes
   */
  visitedNodesv2 = new Set();
  // /**
  //  * Set of Visited Nodes
  //  */
  //  visitedNodesv2 = new Set();
  /**
   * pushbutton constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y, 'PushButton.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // Create a mapping for node label to node
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }
    // Add value Change Listener to Circuit nodes
    this.pinNamedMap['Terminal 1a'].addValueListener((v) => {
      if (v !== this.pinNamedMap['Terminal 1b'].value) {
        this.pinNamedMap['Terminal 1b'].setValue(v, this.pinNamedMap['Terminal 1b']);
      }
    });
    this.pinNamedMap['Terminal 1b'].addValueListener((v) => {
      if (v !== this.pinNamedMap['Terminal 1a'].value) {
        // console.log(v);
        this.pinNamedMap['Terminal 1a'].setValue(v, this.pinNamedMap['Terminal 1a']);
      }
    });
    this.pinNamedMap['Terminal 2a'].addValueListener((v) => {
      this.pinNamedMap['Terminal 2b'].setValue(v, null);
    });
    this.pinNamedMap['Terminal 2b'].addValueListener((v) => {
      this.pinNamedMap['Terminal 2a'].setValue(v, null);
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
      keyName: 'PushButton',
      id: this.id,
      body,
      title: 'Push Button'
    };
  }
  /**
   * Initialize Variable,callback and animation caller when start simulation is pressed
   */
  initSimulation(): void {
    // Determine Arduino Connected ends for all terminals of push button
    for (const i in this.pinNamedMap) {
      if (this.pinNamedMap[i].connectedTo !== null) {
        if (this.pinNamedMap[i].connectedTo.start.parent.keyName === 'ArduinoUno'
          || this.pinNamedMap[i].connectedTo.end.parent.keyName === 'ArduinoUno') {
          this.terminalParent[i] = BreadBoard.getRecArduinov2(this.pinNamedMap[i], i);
        } else {
          this.terminalParent[i] = BreadBoard.getRecArduinoBreadv2(this.pinNamedMap[i], i);
        }
      }
    }
    const Dports = new RegExp('^D([2-9]|[1][0-3])$');
    const Aports = new RegExp('^A([0-5])$');
    // console.log(this.pinNamedMap[''])
    this.elements.unmousedown();
    let iniValue = 0;
    let iniPin = '';
    let by = -1;
    // create mousedown for the button
    this.elements[9].mousedown(() => {
      let val = -1;
      let pullUp = false;
      for (const i in this.terminalParent) {
        // set value only if any pin have inputPullUpEnabled
        if (this.terminalParent[i] !== undefined) {
          pullUp = pullUp || this.terminalParent[i].pullUpEnabled;
        }
      }

      for (const i in this.terminalParent) {
        if (this.terminalParent[i] !== undefined) {
          // set initial value to the pin which connects the digital pin on Arduino
          if ((Dports.test(this.terminalParent[i].label) || Aports.test(this.terminalParent[i].label))
            && this.pinNamedMap[i].value <= 0) {
            iniValue = this.pinNamedMap[i].value;
            iniPin = i;
          }
        }
      }

      if (this.pinNamedMap['Terminal 1a'].value > 0) {
        val = this.pinNamedMap['Terminal 1a'].value;
        // TODO: run for 1a
        if (pullUp) {
          iniValue = val;
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 0;
        // set value to other pins
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 1b'].value > 0) {
        val = this.pinNamedMap['Terminal 1b'].value;
        // TODO: run for 1b
        if (pullUp) {
          iniValue = val;
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 0;
        // set value to other pins
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 2a'].value > 0) {
        val = this.pinNamedMap['Terminal 2a'].value;
        // TODO: run for 2a
        if (pullUp) {
          iniValue = val;
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 1;
        // set value to other pins
        this.pinNamedMap['Terminal 1a'].setValue(val, null);
        this.pinNamedMap['Terminal 1b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 2b'].value > 0) {
        val = this.pinNamedMap['Terminal 2b'].value;
        // TODO: run for 2b
        if (pullUp) {
          iniValue = val;
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 1;
        // set value to other pins
        this.pinNamedMap['Terminal 1a'].setValue(val, null);
        this.pinNamedMap['Terminal 1b'].setValue(val, null);
      }
    });
    // Set mouseup listener for the button
    this.elements[9].mouseup(() => {
      this.MouseUp(by, iniValue);

      if (iniPin !== undefined && iniPin !== null) {
        this.terminalParent[iniPin].setValue(-1, null);
      }
    });
  }
  /**
   * Mouse Up Callback
   * @param by Representing the node whose value > 0
   * @param iniValue Initial value of the node before mousedown
   */
  MouseUp(by: number, iniValue: number) {
    if (by === 0) {
      this.pinNamedMap['Terminal 2a'].setValue(iniValue, null);
      this.pinNamedMap['Terminal 2b'].
        setValue(iniValue, null);
    } else {
      this.pinNamedMap['Terminal 1a'].setValue(iniValue, null);
      this.pinNamedMap['Terminal 1b'].setValue(iniValue, null);
    }
  }
  /** Function removes all  animations and callbacks  */
  closeSimulation(): void {
    this.elements.unmousedown();
    this.elements.unmouseup();
    this.elements.unmouseout();
    this.setClickListener(null);
    this.setDragListeners();
  }
}

/**
 * Slideswitch Class
 */
export class SlideSwitch extends CircuitElement {
  /**
   * if true connected with terminal 1 else connected with terminal 2
   */
  private flag = true;
  /**
   * Slideswitch constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('SlideSwitch', x, y, 'SlideSwitch.json', canvas);
  }
  /**
   * Initialize Slide Switch
   */
  init() {
    this.nodes[1].addValueListener((v) => {
      console.log(v);
      if (this.flag) {
        this.nodes[0].setValue(v, null);
        this.nodes[2].setValue(-1, null);
      } else {
        this.nodes[0].setValue(-1, null);
        this.nodes[2].setValue(v, null);
      }
    });
  }
  /** Animation caller during start simulation button pressed */
  anim() {
    let anim;
    if (this.flag) {
      anim = Raphael.animation({ transform: `t${this.tx + 15},${this.ty}` }, 500);
    } else {
      anim = Raphael.animation({ transform: `t${this.tx},${this.ty}` }, 500);
    }
    this.elements[1].animate(anim);
    this.flag = !this.flag;
    this.nodes[1].setValue(this.nodes[1].value, this.nodes[1]);
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
      title: 'Slide Switch'
    };
  }
  /**
   * Called on Start Simulation.
   */
  initSimulation(): void {
    this.elements.unmousedown();
    this.elements.unclick();
    this.elements.click(() => {
      this.anim();
    });
    this.nodes[1].setValue(5, null);
  }
  /**
   * Called on stop simulation.
   */
  closeSimulation(): void {
    this.elements.unclick();
    this.setDragListeners();
    this.setClickListener(null);
    const anim = Raphael.animation({ transform: `t${this.tx},${this.ty}` }, 500);
    this.elements[1].animate(anim);
  }
}
