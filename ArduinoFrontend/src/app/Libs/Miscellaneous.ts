import { CircuitElement } from './CircuitElement';
import { Point } from './Point';
import { Workspace } from './Workspace';

export class Label extends CircuitElement {
  text = 'Label';
  fontSize = 15;
  fontColor = '#000000';
  fontStyle = 'normal';
  // normal | bold | bolder | lighter
  fontWeight = 'normal';
  constructor(public canvas: any, x: number, y: number) {
    super('Label', x, y);
    this.elements.push(
      canvas.text(x, y, this.text)
    );
    this.update();
    this.setClickListener(null);
    this.setDragListeners();
    this.setHoverListener();
    window['queue'] -= 1;
  }
<<<<<<< HEAD
=======
  SaveData() {
    return {
      text: this.text,
      size: this.fontSize,
      color: this.fontColor,
      weight: this.fontWeight,
      style: this.fontStyle
    };
  }
  LoadData(data: any) {
    this.text = data.data.text;
    this.fontSize = data.data.size;
    this.fontColor = data.data.color;
    this.fontWeight = data.data.weight;
    this.fontStyle = data.data.style;
    this.elements.transform(`t${this.tx},${this.ty}`);
    this.update();
  }
>>>>>>> master
  update() {
    this.elements[0]
      .attr({
        'font-size': this.fontSize,
        'font-family': 'Times New Roman,Georgia,Serif',
        'font-weight': this.fontWeight,
        'font-style': this.fontStyle,
        text: this.text,
        fill: this.fontColor
      });
  }
<<<<<<< HEAD
  save() {
  }
  load(data: any): void {
  }
=======
>>>>>>> master
  changeLabel(value: string) {
    if (value === '') {
      // TODO: Show Toast
      return;
    }
    this.text = value;
    this.update();
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    let tmp;
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';

    const inp = document.createElement('input');
    inp.value = this.text;
    inp.onkeyup = () => {
      this.changeLabel(inp.value);
    };

    inp.addEventListener('focusout', () => {
      if (inp.value === '') {
        inp.value = this.text;
      }
    });
    const sz = document.createElement('input');
    sz.type = 'number';
    sz.min = '10';
    sz.value = `${this.fontSize}`;
    sz.max = '100';
    sz.onchange = () => {
      const num = parseInt(sz.value, 10);
      if (num) {
        this.fontSize = Math.min(100, Math.max(10, num));
        this.update();
      }
    };
    const colors = [
      ['Black', '#000000'],
      ['Red', '#ff0000'],
      ['Green', '#04942b'],
      ['Blue', '#0000ff'],
      ['Purple', '#6a0dad'],
    ];
    const colorSelect = document.createElement('select');
    tmp = '';
    for (const col of colors) {
      tmp += `<option>${col[0]}</option>`;
    }
    colorSelect.innerHTML = tmp;
    colorSelect.onchange = () => {
      this.fontColor = colors[colorSelect.selectedIndex][1];
      this.update();
    };
    const styles = ['Normal', 'Italic'];
    const styleSelect = document.createElement('select');
    tmp = '';
    for (const styl of styles) {
      tmp += `<option>${styl}</option>`;
    }
    styleSelect.innerHTML = tmp;
    styleSelect.onchange = () => {
      this.fontStyle = styles[styleSelect.selectedIndex];
      this.update();
    };
    const weights = ['Normal', 'Bold', 'Bolder', 'Lighter'];
    const weightSelect = document.createElement('select');
    tmp = '';
    for (const wght of weights) {
      tmp += `<option>${wght}</option>`;
    }
    weightSelect.innerHTML = tmp;
    weightSelect.onchange = () => {
      this.fontWeight = weights[weightSelect.selectedIndex];
      this.update();
    };

    tmp = document.createElement('label');
    tmp.innerText = 'Text';
    body.appendChild(tmp);
    body.appendChild(inp);
    tmp = document.createElement('label');
    tmp.innerText = 'Size';
    body.appendChild(tmp);
    body.appendChild(sz);
    tmp = document.createElement('label');
    tmp.innerText = 'Colors';
    body.appendChild(tmp);
    body.appendChild(colorSelect);
    tmp = document.createElement('label');
    tmp.innerText = 'Styles';
    body.appendChild(tmp);
    body.appendChild(styleSelect);
    tmp = document.createElement('label');
    tmp.innerText = 'Weight';
    body.appendChild(tmp);
    body.appendChild(weightSelect);

    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Label'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
