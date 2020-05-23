import { CircuitElement } from './CircuitElement';
import { Point } from './Point';
import { ShowOnDirtyErrorStateMatcher } from '@angular/material';

export class Resistor extends CircuitElement {
  static colorTable: string[] = [];
  static tolColorMap: number[] = [];
  static toleranceValues: string[] = [];
  static unitLabels: string[] = [];
  static unitValues: number[] = [];

  value: number;
  toleranceIndex: number;

  constructor(public canvas: any, x: number, y: number) {
    super('Resistor', x, y, 'Resistor.json', canvas);
  }
  init() {
    if (Resistor.colorTable.length === 0) {
      Resistor.colorTable = this.data.colorTable;
      Resistor.toleranceValues = this.data.toleranceValues;
      Resistor.tolColorMap = this.data.tolColorMap;
      Resistor.unitLabels = this.data.unitLabels;
      Resistor.unitValues = this.data.unitValues;
    }
    this.value = this.data.initial;
    this.toleranceIndex = this.data.initialToleranceIndex;
    this.updateColors();
    delete this.data;
    this.data = null;
  }
  updateColors() {
    const cur = this.getValue();
    this.elements[1].attr({
      fill: Resistor.colorTable[cur.third]
    }); // Third
    this.elements[2].attr({
      fill: Resistor.colorTable[cur.second]
    }); // Second
    this.elements[3].attr({
      fill: Resistor.colorTable[cur.first]
    }); // First
    this.elements[5].attr({
      fill: Resistor.colorTable[cur.multiplier]
    }); // multiplier
    this.elements[4].attr({
      fill: Resistor.colorTable[this.toleranceIndex]
    }); // Tolerance
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
    if (index >= 0 && index <= Resistor.unitValues.length) {
      return Resistor.unitValues[index];
    }
    return 0;
  }
  update(value: string, unitIndex: number) {
    const val = parseFloat(value);
    const p = this.getPower(unitIndex);
    const tmp = parseInt((val * p).toFixed(0), 10);
    if (value.length > 12 || isNaN(tmp) || tmp === Infinity || tmp < 1.0 || `${tmp}`.length > 12) {
      window['showToast']('Resistance Not possible');
      return;
    } else {
      this.value = tmp;
      this.updateColors();
    }
  }

  getInputValues() {
    const val = this.value;
    let tmp = val;
    for (let i = 0; i < Resistor.unitValues.length; ++i) {
      tmp = Math.floor(val / Resistor.unitValues[i]);
      if (tmp > 0) {
        continue;
      } else {
        return {
          index: i - 1,
          val: val / Resistor.unitValues[i - 1]
        };
      }
    }
    return {
      index: Resistor.unitValues.length - 1,
      val: this.value / Resistor.unitValues[
        Resistor.unitLabels.length - 1
      ]
    };
  }
  getName() {
    const cur = this.getInputValues();
    return `Resistor ${cur.val}${Resistor.unitLabels[cur.index]}`;
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

    const unit = document.createElement('select');
    tmp = '';
    for (const ohm of Resistor.unitLabels) {
      tmp += `<option>${ohm} &#8486;</option>`;
    }
    unit.innerHTML = tmp;
    unit.selectedIndex = cur.index;

    const tole = document.createElement('select');
    tmp = '';
    for (const t of Resistor.toleranceValues) {
      tmp += `<option>&#177; ${t}%</option>`;
    }
    tole.innerHTML = tmp;

    unit.onchange = () => this.update(inp.value, unit.selectedIndex);
    inp.onkeyup = () => this.update(inp.value, unit.selectedIndex);
    inp.onchange = () => this.update(inp.value, unit.selectedIndex);
    tole.onchange = () => {
      this.toleranceIndex = Resistor.tolColorMap[tole.selectedIndex];
      this.updateColors();
    };

    const lab = document.createElement('label');
    lab.innerText = 'Resistance';
    body.append(lab);
    body.append(inp);
    body.append(unit);
    const lab2 = document.createElement('label');
    lab2.innerText = 'Tolerance';
    body.append(lab2);
    body.append(tole);

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
