import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

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
      this.pinNamedMap['Terminal 1b'].setValue(v, null);
    });
    this.pinNamedMap['Terminal 1b'].addValueListener((v) => {
      this.pinNamedMap['Terminal 1a'].setValue(v, null);
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
  private reverseAnim = true;
  /**
   * Slideswitch constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('SlideSwitch', x, y, 'SlideSwitch.json', canvas);
  }
  /** Animation caller during start simulation button pressed */
  anim() {
    let anim;
    if (this.reverseAnim) {
      anim = Raphael.animation({ transform: 't15,0' }, 500);
    } else {
      anim = Raphael.animation({ transform: 't0,0' }, 500);
    }
    this.elements[1].animate(anim);
    this.reverseAnim = !this.reverseAnim;
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
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
