import { CircuitElement } from '../CircuitElement';
import { BreadBoard } from '../General';

/**
 * Declare Raphael so that build don't throws error
 */
declare var Raphael;
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
        console.log(v);
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

    // Determine Arduino connected ends for all terminals of push button
    this.terminalParent['terminal1a'] = BreadBoard.getRecArduinov2(this.pinNamedMap['Terminal 1a'], 'Terminal 1a');
    this.terminalParent['terminal1b'] = BreadBoard.getRecArduinov2(this.pinNamedMap['Terminal 1b'], 'Terminal 1b');
    this.terminalParent['terminal2a'] = BreadBoard.getRecArduinov2(this.pinNamedMap['Terminal 2a'], 'Terminal 2a');
    this.terminalParent['terminal2b'] = BreadBoard.getRecArduinov2(this.pinNamedMap['Terminal 2b'], 'Terminal 2b');

    // console.log(this.pinNamedMap[''])
    this.elements.unmousedown();
    let iniValue = -1;
    let by = -1;
    // create mousedown for the button
    this.elements[9].mousedown(() => {
      let val = -1;

      // set value only if any pin have inputPullUpEnabled
      const pullUp = this.terminalParent['terminal1a'].pullUpEnabled || this.terminalParent['terminal1b'].pullUpEnabled
        || this.terminalParent['terminal2a'].pullUpEnabled || this.terminalParent['terminal2b'].pullUpEnabled;

      if (this.pinNamedMap['Terminal 1a'].value > 0) {
        val = this.pinNamedMap['Terminal 1a'].value;
        // TODO: run for 1a
        if (pullUp) {
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 0;
        iniValue = this.pinNamedMap['Terminal 2a'].value;
        // set value to other pins
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 1b'].value > 0) {
        val = this.pinNamedMap['Terminal 1b'].value;
        // TODO: run for 1b
        if (pullUp) {
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 0;
        iniValue = this.pinNamedMap['Terminal 2a'].value;
        // set value to other pins
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 2a'].value > 0) {
        val = this.pinNamedMap['Terminal 2a'].value;
        // TODO: run for 2a
        if (pullUp) {
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 1;
        iniValue = this.pinNamedMap['Terminal 1a'].value;
        // set value to other pins
        this.pinNamedMap['Terminal 1a'].setValue(val, null);
        this.pinNamedMap['Terminal 1b'].setValue(val, null);
      } else if (this.pinNamedMap['Terminal 2b'].value > 0) {
        val = this.pinNamedMap['Terminal 2b'].value;
        // TODO: run for 2b
        if (pullUp) {
          // TODO: If pullUp enabled set val to zero
          val = 0;
        }
        by = 1;
        iniValue = this.pinNamedMap['Terminal 1a'].value;
        // set value to other pins
        this.pinNamedMap['Terminal 1a'].setValue(val, null);
        this.pinNamedMap['Terminal 1b'].setValue(val, null);
      }

      // console.log(val);
    });
    // Set mouseup listener for the button
    this.elements[9].mouseup(() => this.MouseUp(by, iniValue));
    this.elements[9].mouseout(() => this.MouseUp(by, iniValue));
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
