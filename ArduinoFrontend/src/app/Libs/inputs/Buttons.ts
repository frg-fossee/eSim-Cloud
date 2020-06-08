import { CircuitElement } from '../CircuitElement';

declare var Raphael;

export class PushButton extends CircuitElement {
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
  private flag = true; // if true connected with terminal 1 else connected with terminal 2
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
