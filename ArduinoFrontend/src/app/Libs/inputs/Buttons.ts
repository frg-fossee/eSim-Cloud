import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class PushButton extends CircuitElement {
<<<<<<< HEAD
  static pointHalf = 4;
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y, 'PushButton.json', canvas);
  }
  save() {
  }
  load(data: any): void {
=======
  pinNamedMap: any = {};
  constructor(public canvas: any, x: number, y: number) {
    super('PushButton', x, y, 'PushButton.json', canvas);
  }
  init() {
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }
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
  logic(v) {

>>>>>>> master
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: 'PushButton',
      id: this.id,
      body,
      title: 'Push Button'
    };
  }
  initSimulation(): void {
    // console.log(this.pinNamedMap[''])
    this.elements.unmousedown();
    let iniValue = -1;
    let by = -1;
    this.elements[9].mousedown(() => {
      const val = this.pinNamedMap['Terminal 1a'].value;
      if (val > 0) {
        by = 0;
        iniValue = this.pinNamedMap['Terminal 2a'].value;
        this.pinNamedMap['Terminal 2a'].setValue(val, null);
        this.pinNamedMap['Terminal 2b'].setValue(val, null);
      } else {
        by = 1;
        iniValue = this.pinNamedMap['Terminal 1a'].value;
        this.pinNamedMap['Terminal 1a'].setValue(val, null);
        this.pinNamedMap['Terminal 1b'].setValue(val, null);
      }
    });
    this.elements[9].mouseup(() => this.MouseUp(by, iniValue));
    this.elements[9].mouseout(() => this.MouseUp(by, iniValue));
  }
  MouseUp(by: number, iniValue: number) {
    if (by === 0) {
      this.pinNamedMap['Terminal 2a'].setValue(iniValue, null);
      this.pinNamedMap['Terminal 2b'].setValue(iniValue, null);
    } else {
      this.pinNamedMap['Terminal 1a'].setValue(iniValue, null);
      this.pinNamedMap['Terminal 1b'].setValue(iniValue, null);
    }
  }
  closeSimulation(): void {
    this.elements.unmousedown();
    this.elements.unmouseup();
    this.elements.unmouseout();
    this.setClickListener(null);
  }
  simulate(): void {
  }

}


export class SlideSwitch extends CircuitElement {
  static pointHalf = 4;
  private reverseAnim = true;

  constructor(public canvas: any, x: number, y: number) {
    super('SlideSwitch', x, y, 'SlideSwitch.json', canvas);
  }
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
<<<<<<< HEAD
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
=======
>>>>>>> master
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
