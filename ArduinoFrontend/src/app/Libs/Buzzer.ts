import { Point } from './Point';
import { CircuitElement } from './CircuitElement';

declare var window; // Declare window so that custom created function don't throw error

/**
 * Buzzer Class
 */
export class Buzzer extends CircuitElement {
  static type = 'Piezoelectric Buzzer';
  // Specification of Piezoelectric Buzzer (SI Unit)
  static specification = {
    voltage: {
      min: 4,
      max: 8
    },
    current: {
      max: 0.03
    },
    frequency: 2300
  };

  static pointHalf = 3; // The Node half size

  legPlus: any; // Positive terminal line
  legNeg: any; // Negative terminal line

  outer: any; // Buzzer outer circle
  inner: any; // Buzzer inner circle


  cx: number; // Buzzer Center X
  cy: number; // Buzzer Center Y


  constructor(private canvas: any, public x: number, public y: number) {
    super('Buzzer');

    // 30 => Buzzer Radius
    this.cx = this.x + 30;
    this.cy = this.y + 30;


    // Create terminal
    this.legPlus = this.canvas.path(`M${this.cx - 15},${this.cy + 20} L${this.cx - 15},${this.cy + 50}Z`);
    this.legNeg = this.canvas.path(`M${this.cx + 15},${this.cy + 20} L${this.cx + 15},${this.cy + 50}Z`);

    // Create outer circle and fill color
    this.outer = this.canvas.circle(this.cx, this.cy, 30);
    this.outer.attr({ fill: '#383838', stroke: '#383838' });
    // Create inner circle and fill color
    this.inner = this.canvas.circle(this.cx, this.cy, 5);
    this.inner.attr({ fill: ' #aaa9ad', stroke: ' #aaa9ad' });


    this.nodes = [
      new Point(
        canvas,
        this.cx - 15 - Buzzer.pointHalf,
        this.cy + 50 - Buzzer.pointHalf,
        'POSITIVE',
        Buzzer.pointHalf,
        this
      ),
      new Point(
        canvas,
        this.cx + 15 - Buzzer.pointHalf,
        this.cy + 50 - Buzzer.pointHalf,
        'Negative',
        Buzzer.pointHalf,
        this
      )
    ];

    this.outer.hover(() => {
      this.nodes[0].show();
      this.nodes[1].show();
    }, () => {
      this.nodes[0].hide();
      this.nodes[1].hide();
    });


    // Set click listener
    this.outer.click(() => {
      // select current breadboard
      window['isSelected'] = true;
      window['Selected'] = this;
      // TODO: Show Properties
    });


    let tmpx = x;
    let tmpy = y;
    // set drag listener
    this.outer.drag((dx, dy) => {
      // update position of inner and outer circle
      this.outer.attr({ cx: this.cx + dx, cy: this.cy + dy });
      this.inner.attr({ cx: this.cx + dx, cy: this.cy + dy });

      // Update position of terminal line
      this.legPlus.animate({ path: `M${this.cx + dx - 15},${this.cy + dy + 20} L${this.cx + dx - 15},${this.cy + dy + 50}Z` }, 1);
      this.legNeg.animate({ path: `M${this.cx + dx + 15},${this.cy + dy + 20} L${this.cx + dx + 15},${this.cy + dy + 50}Z` }, 1);

      // Update circuit node
      this.nodes[0].move(this.cx - 15 + dx - Buzzer.pointHalf, this.cy + dy + 50 - Buzzer.pointHalf);
      this.nodes[1].move(this.cx + 15 + dx - Buzzer.pointHalf, this.cy + dy + 50 - Buzzer.pointHalf);

      // Update tempoary position
      tmpx = this.cx + dx;
      tmpy = this.cy + dy;
    }, () => {
      tmpx = x;
      tmpy = y;
    }, () => {
      // Get Changed position
      this.cx = tmpx;
      this.cy = tmpy;
    });
  }
  // return propeties object
  properties() {
    const body = document.createElement('div');
    body.innerHTML = '<h6>Buzzer</h6>';
    return {
      keyName: this.keyName,
      id: this.id,
      body
    };
  }
  // remove element from canvas
  remove(): void {
    // remove terminal
    this.legNeg.remove();
    this.legPlus.remove();
    // remove inner and outer circle
    this.outer.remove();
    this.inner.remove();
  }
  // return save object
  save() {
    return {
      x: this.x,
      y: this.y,
      id: this.id
    };
  }
  // load data from saved object
  load(data: any) {
    this.x = data.x;
    this.y = data.y;
    this.id = data.id;
  }
  // returns node pointer on basis of x,y position
  getNode(x: number, y: number) {
    for (let i = 0; i < 2; ++i) {
      if (this.nodes[i].x === (x - Buzzer.pointHalf) && this.nodes[i].y === (y - Buzzer.pointHalf)) {
        return this.nodes[0];
      }
    }
    return null;
  }

  initSimulation() {
    // let AudioContext = window.AudioContext || window.webkitAudioContext;
    // let audioCtx = new AudioContext();
    // let oscillator = audioCtx.createOscillator();
    // oscillator.frequency.value = Buzzer.specification.frequency;
    // oscillator.connect(audioCtx.destination);
    // oscillator.start();
    // setTimeout(()=>oscillator.stop(),1000);
  }
  simulate() {
    // TODO: Play Music on Simulation
  }
  closeSimulation() {

  }
}
