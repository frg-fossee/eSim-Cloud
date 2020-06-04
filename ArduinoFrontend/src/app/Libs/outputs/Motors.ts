import { CircuitElement } from '../CircuitElement';

declare var Raphael;

export class Motor extends CircuitElement {
  dirn = 1;
  cx = 0;
  cy = 0;
  rpm: any;
  constructor(public canvas: any, x: number, y: number) {
    super('Motor', x, y, 'Motor.json', canvas);
  }
  // 6v -> 9000rpm ->
  init() {
    this.nodes[0].addValueListener((v, cby, par) => {
      if (cby === this.nodes[1]) {
        return;
      }
      this.nodes[1].setValue(v, this.nodes[0]);
      this.dirn = -1;
      if (v < 0) {
        this.elements[1].stop();
      } else {
        if (this.rpm) {
          this.rpm.remove();
          this.rpm = null;
        }
        const anim = Raphael.animation({ transform: `r-360` }, 400 / v);
        this.elements[1].animate(anim.repeat(Infinity));
        this.rpm = this.canvas.text(this.x + this.tx, this.y + this.ty - 30, `${1500 * v}RPM`);
        this.rpm.attr({
          'font-size': 20,
        });
      }
    });

    this.nodes[1].addValueListener((v, cby, par) => {
      if (cby === this.nodes[0]) {
        return;
      }
      this.nodes[0].setValue(v, this.nodes[1]);
      if (v < 0) {
        this.elements[1].stop();
      } else {
        // const ok = this.elements[1].attr();
        // console.log('sss');
        console.log(400 / v);
        const anim = Raphael.animation({ transform: `r360` }, 400 / v);
        this.elements[1].animate(anim.repeat(Infinity));
        // setTimeout(() => this.elements[1].stop(), 3000);
        this.rpm = this.canvas.text(this.x + this.tx, this.y + this.ty - 30, `${1500 * v}RPM`);
        this.rpm.attr({
          'font-size': 20,
        });
      }
    });
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor'
    };
  }
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
  }
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
  }
  simulate(): void {
  }

}


export class L298N extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('L298N', x, y, 'L298N.json', canvas);
  }
  init() {
    console.log(this.nodes);
  }
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
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}

export class ServoMotor extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('ServoMotor', x, y, 'ServoMotor.json', canvas);
  }
  animate(angle: number) {
    const anim = Raphael.animation({ transform: `r${angle}` }, 2500);
    this.elements[1].animate(anim);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
