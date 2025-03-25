import { CircuitElement } from './CircuitElement';
/**
 * Label class
 */
export class Label extends CircuitElement {
  /**
   * Text of the label
   */
  text = 'Label';
  /**
   * Font Size of the Label
   */
  fontSize = 15;
  /**
   * Font color of the label.
   */
  fontColor = '#000000';
  /**
   * Font style of the label
   */
  fontStyle = 'normal';
  /**
   * Font weight of the label.
   */
  fontWeight = 'normal';
  /**
   * Get Name Function
   */
  getName = null;
  /**
   * Label constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
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
  /** Saves data for label class */
  SaveData() {
    return {
      text: this.text,
      size: this.fontSize,
      color: this.fontColor,
      weight: this.fontWeight,
      style: this.fontStyle
    };
  }
  /**
   * Loads data of SaveData()
   * @param data saved object
   */
  LoadData(data: any) {
    this.text = data.data.text;
    this.fontSize = data.data.size;
    this.fontColor = data.data.color;
    this.fontWeight = data.data.weight;
    this.fontStyle = data.data.style;
    this.elements.transform(`t${this.tx},${this.ty}`);
    this.update();
  }
  /** Function updates the label class */
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
  /** Changes text for label  */
  changeLabel(value: string) {
    // if text field is empty
    if (value === '') {
      // TODO: Show Toast
      window['showToast']('Label cannot be empty', true);
      return;
    }
    this.text = value;
    this.update();
  }
  /**
   * Function provides label details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
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
  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
  }
  /**
   * Called on Stop simulation.
   */
  closeSimulation(): void {
  }
}
