import { CircuitElement } from '../CircuitElement';

declare var Raphael;
/**
 * Pushbutton Class
 */
export class PushButton extends CircuitElement {
  pinNamedMap: any = {};
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
    // console.log(this.pinNamedMap[''])
    this.elements.unmousedown();
    let iniValue = -1;
    let by = -1;
    // create mousedown for the button
    this.elements[9].mousedown(() => {
      let val = this.pinNamedMap['Terminal 1a'].value;
      if (val > 0) {
        by = 0;
        iniValue = this.pinNamedMap['Terminal 2a'].value;
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else {
        by = 1;
        val = this.pinNamedMap['Terminal 2a'].value;
        iniValue = this.pinNamedMap['Terminal 1a'].value;
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
  simulate(): void {
  }

}

/**
 * Slideswitch Class
 */
export class SlideSwitch extends CircuitElement {
  private flag = true; // if true connected with terminal 1 else connected with terminal 2
  /**
   * Slideswitch constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('SlideSwitch', x, y, 'SlideSwitch.json', canvas);
  }
  init() {
    // this.nodes[0]
    console.log(this.nodes[0].label);
    console.log(this.nodes[1].label);
    console.log(this.nodes[2].label);
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
  initSimulation(): void {
    this.elements.unmousedown();
    this.elements.unclick();
    this.elements.click(() => {
      this.anim();
    });
    this.nodes[1].setValue(5, null);
  }
  closeSimulation(): void {
    this.elements.unclick();
    this.setDragListeners();
    this.setClickListener(null);
    const anim = Raphael.animation({ transform: `t${this.tx},${this.ty}` }, 500);
    this.elements[1].animate(anim);
  }
  simulate(): void {
  }

}
