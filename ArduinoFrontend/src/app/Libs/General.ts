import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class Resistor extends CircuitElement {
  static pointHalf = 5;
  static colorTable = [
    '#000000',
    '#A52A2A',
    '#FF0000',
    '#FFA500',
    '#FFFF00',
    '#008000',
    '#0000FF',
    '#4B0082',
    '#808080',
    '#FFFFFF',
    '#FFD700',
    '#C0C0C0'
  ];
  value = 1000;
  constructor(public canvas: any, x: number, y: number) {
    super('Resistor', x, y);
    this.elements.push(
      canvas.image('assets/images/components/Resistor.svg', this.x, this.y, 24, 100),
      canvas.path(`M${x + 21.2},${y + 46.3}H${x + 2.8}
      c0,1.3,0,3.7,0,6.1h18.5
      C${x + 21.2},${y + 50},${x + 21.2},${y + 47.7},${x + 21.2},${y + 46.3}z`)
        .attr({ stroke: 'none' }),
      canvas.path(`M${x + 21.2},${y + 59.4}c0-0.6,0-1.8,0-3.3H${x + 2.8}
      c0,1.5,0,2.7,0,3.3c0,1.2-0.1,2.2-0.4,3.1h19.2
      C${x + 21.4},${y + 61.6},${x + 21.2},${y + 60.6},${x + 21.2},${y + 59.4}z`)
        .attr({ stroke: 'none' }),
      canvas.path(`M${x + 24},${y + 72.3}c0-1.8-0.2-3.1-0.4-4.3H${x + 0.4}
      C${x + 0.2},${y + 69.1},${x + 0},${y + 70.5},${x + 0},${y + 72.3}
      c0,0.8,0.1,1.4,0.3,2.1h23.5
      C${x + 23.9},${y + 73.7},${x + 24},${y + 73},${x + 24},${y + 72.3}z`)
        .attr({ stroke: 'none' }),
      canvas.path(`M${x + 0},${y + 27}
      c0,0.5,0,1,0.1,1.5h23.8c0-0.5,0.1-1,0.1-1.5c0-0.3,0-0.6-0.1-0.9H${x + 0.1}
      C${x + 0},${y + 26.4},${x + 0},${y + 26.7},${x + 0},${y + 27}z`)
        .attr({ stroke: 'none' }),
      canvas.path(`M${x + 21.6},${y + 36.7}H${x + 2.4}
      c0.2,0.9,0.4,1.9,0.4,3.1c0,0.6,0,1.8,0,3.3h18.5c0-1.5,0-2.7,0-3.3
      C${x + 21.2},${y + 38.6},${x + 21.4},${y + 37.6},${x + 21.6},${y + 36.7}z`)
        .attr({ stroke: 'none' })
    );
    this.elements[4].attr({
      fill: Resistor.colorTable[10]
    }); // Tolerance
    this.updateColors();
    this.nodes = [
      new Point(canvas, x + 7, y + 0, 'Power', Resistor.pointHalf, this),
      new Point(canvas, x + 7, y + 91, 'Vout', Resistor.pointHalf, this)
    ];
    this.setDragListeners();
    this.setClickListener(null);
    this.setHoverListener();
  }

  updateColors() {
    const cur = this.getValue();
    this.elements[1].attr({ fill: Resistor.colorTable[cur.third] }); // Third
    this.elements[2].attr({ fill: Resistor.colorTable[cur.second] }); // Second
    this.elements[3].attr({ fill: Resistor.colorTable[cur.first] }); // First
    this.elements[5].attr({ fill: Resistor.colorTable[cur.multiplier] }); // multiplier
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  getValue() {
    const l = `${this.value}`.length;
    const tmp = `${this.value}`;
    if (l < 2) {
      return {
        multiplier: 11,
        first: this.value,
        second: 0,
        third: 0
      };
    } else if (l < 3) {
      return {
        multiplier: 10,
        first: +tmp.charAt(0),
        second: +tmp.charAt(1),
        third: 0,
      };
    }
    return {
      multiplier: l - 3,
      first: +tmp.charAt(0),
      second: +tmp.charAt(1),
      third: +tmp.charAt(2),
    };
  }
  private getPower(index: number) {
    switch (index) {
      case 0:
        return 1;
      case 1:
        return 1000;
      case 2:
        return 1000000;
      case 3:
        return 1000000000;
      default:
        return 0;
    }
  }
  update(value: string, unitIndex: number) {
    const val = parseFloat(value);
    const p = this.getPower(unitIndex);
    const tmp = parseInt((val * p).toFixed(0), 10);

    if (isNaN(tmp) || tmp === Infinity || tmp < 1.0 || `${tmp}`.length > 12) {
      // TODO: Show Toast
      console.log('Not Possible');
      return;
    }
    if (tmp) {
      this.value = tmp;
      this.updateColors();
    }
  }

  getInputValues() {
    let val = this.value;
    let tmp = Math.floor(val / 1000);
    if (tmp > 0) {
      val = tmp;
      tmp = Math.floor(tmp / 1000);

      if (tmp > 0) {
        val = tmp;
        tmp = Math.floor(tmp / 1000);
        if (tmp > 0) {
          return {
            index: 3,
            val
          };
        }
        return {
          index: 2,
          val
        };
      }
      return {
        index: 1,
        val
      };
    }
    return {
      index: 0,
      val: this.value
    };
  }

  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    let tmp;
    const cur = this.getInputValues();
    const body = document.createElement('div');
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = `${cur.val}`;
    inp.min = '1';
    inp.addEventListener('wheel', (event) => {
      event.preventDefault();
    });

    const ohms = ['', 'K', 'M', 'G'];
    const unit = document.createElement('select');
    tmp = '';
    for (const ohm of ohms) {
      tmp += `<option>${ohm} &#8486;</option>`;
    }
    unit.innerHTML = tmp;
    unit.selectedIndex = cur.index;

    unit.onchange = () => this.update(inp.value, unit.selectedIndex);
    inp.onkeyup = () => this.update(inp.value, unit.selectedIndex);
    inp.onchange = () => this.update(inp.value, unit.selectedIndex);

    const lab = document.createElement('label');
    lab.innerText = 'Resistance';
    body.append(lab);
    body.append(inp);
    body.append(unit);
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Resistor',
      body
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
