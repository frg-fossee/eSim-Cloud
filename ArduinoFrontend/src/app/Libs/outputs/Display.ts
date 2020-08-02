import { CircuitElement } from '../CircuitElement';
import { LCDUtils, InstructionType } from './LCDUtils';
import _ from 'lodash';

enum RegisterType {
  Instruction = 0, Data = 1
}

enum DataMode {
  Write = 0, Read = 1
}


class LCDPixel {
  /**
   * Index of the parent grid
   */
  parentIndex: [number, number];

  /**
   * Self-index inside the parent grid
   */
  index: [number, number];

  posX: number;

  posY: number;

  width: number;

  height: number;

  dimColor: string;

  glowColor: string;

  isOn: boolean;

  brightness: number;

  constructor(parentIndex: [number, number], index: [number, number], posX: number,
              posY: number, width: number, height: number, dimColor: string, glowColor: string) {
    this.parentIndex = parentIndex;
    this.index = index;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.dimColor = dimColor;
    this.glowColor = glowColor;
    this.isOn = false;
    this.brightness = 100;
  }

  switch(value) {
    this.isOn = parseInt(value, 2) && true;
  }

  getColor() {
    return this.isOn ? this.glowColor : this.dimColor;
  }

  getName() {
    return `G:${this.parentIndex[0]}:${this.parentIndex[1]}:${this.index[0]}:${this.index[1]}`;
  }

  getCanvasRepr() {
    return {
      name: this.getName(),
      type: 'rectangle',
      width: this.width,
      height: this.height,
      x: this.posX,
      y: this.posY,
      fill: this.getColor(),
    };
  }
}

class LCDCharacterPanel {

  N_ROW: number;

  N_COLUMN: number;

  index: [number, number];
  pixels: LCDPixel[][];
  posX: number;
  posY: number;
  pixelWidth: number;
  pixelHeight: number;
  barColor: string;
  barGlowColor: string;
  intraSpacing: number;

  initialiseLCDPixels() {
    let tempRowsX: number;
    let posX = this.posX;
    let posY = this.posY;

    this.pixels = [[]];
    for (let i = 0; i < this.N_ROW; i++) {
      tempRowsX = posX;
      this.pixels[i] = [];
      for (let j = 0; j < this.N_COLUMN; j++) {
        this.pixels[i][j] = new LCDPixel(
          this.index,
          [i, j],
          posX,
          posY,
          this.pixelWidth,
          this.pixelHeight,
          this.barColor,
          this.barGlowColor
        );
        posX = posX + this.pixelWidth + this.intraSpacing;
      }
      posX = tempRowsX;
      posY = posY + this.pixelHeight +  this.intraSpacing;
    }
  }

  drawCharacter(character: string) {
    const characterDisplayBytes = LCDUtils.getDisplayBytes(character);
    for (let i = 0; i < this.N_ROW - 1; i++) {
      for (let j = 0; j < this.N_COLUMN; j++) {
        this.pixels[i][j].switch(characterDisplayBytes[i][j]);
      }
    }
  }

  getCanvasRepr(): any[] {
    const canvasGrid = [];
    for (const rowPixels of this.pixels) {
      for (const pixel of rowPixels) {
        canvasGrid.push(pixel.getCanvasRepr());
      }
    }
    return canvasGrid;
  }

  constructor(index: [number, number], N_ROW: number, N_COLUMN: number,
              posX: number, posY: number, pixelWidth: number, pixelHeight: number,
              barColor: string, barGlowColor: string, intraSpacing: number) {
    this.index = index;
    this.N_ROW = N_ROW;
    this.N_COLUMN = N_COLUMN;
    this.posX = posX;
    this.posY = posY;
    this.pixelHeight = pixelHeight;
    this.pixelWidth = pixelWidth;
    this.barColor = barColor;
    this.barGlowColor = barGlowColor;
    this.intraSpacing = intraSpacing;
    this.initialiseLCDPixels();
  }
}

/**
 * LCD16X2 Class
 */
export class LCD16X2 extends CircuitElement {
  /**
   * Map of pin name to Circuit Node
   */
  pinNamedMap: any = {};

  cursorPosition: [number, number] = [0, 0];

  /**
   * Map from character panel index to character panel
   */
  characterPanels: any = {};

  previousEValue = 0;

  isDisplayOn = false;

  autoCursorPosition = 0;

  /**
   * LCD16X2 constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('LCD16X2', x, y, 'LCD16X2.json', canvas);
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
      title: 'LCD Display 16x2'
    };
  }

  getRegisterType(): RegisterType {
    return this.pinNamedMap['RS'].value & 1;
  }

  getDataMode(): DataMode {
    return this.pinNamedMap['RW'].value & 1;
  }

  /**
   * Processes the data registered on data buses
   */
  latchData(): void {
    const registerType = this.getRegisterType();
    if (registerType === RegisterType.Data) {
      this.processData();
      this.moveCursor(this.autoCursorPosition ? 'right' : 'left');
    } else if (registerType === RegisterType.Instruction) {
      this.processInstructions();
    }
  }

  moveCursor(direction: string) {
    console.log(this.cursorPosition);
    console.log('move cursor to', direction);
    if (direction === 'right') {
      this.cursorPosition[1] += 1;
      if (this.cursorPosition[1] > 40) {
        this.cursorPosition = [this.cursorPosition[0] + 1, 0];
      }
    } else {
      this.cursorPosition[1] -= 1;
      if (this.cursorPosition[1] < 0) {
        this.cursorPosition[1] = 0;
      }
    }
    console.log('movd: ');
    console.log(this.cursorPosition);
  }

  readDatabuses(log = false) {
    let data = '';

    for (let i = 7; i >= 0; i--) {
      data += (this.pinNamedMap[`DB${i}`].value > 0 ? '1' : '0');
    }
    if (log) {
      console.log(data);
    }
    // returns output in this form "<DB7><DB6><DB5>...<DB0>"
    return data;
  }

  processData() {
    const data = this.readDatabuses(false);
    const character = String.fromCharCode(parseInt(data, 2));
    const characterPanel = this.characterPanels[`${this.cursorPosition.join(':')}`];
    characterPanel.drawCharacter(character);
  }

  clearDisplay() {
    Object.values(this.characterPanels).forEach((panel: LCDCharacterPanel) => panel.drawCharacter(' '));
  }

  processInstructions() {
    const data = this.readDatabuses();
    const instructionType = LCDUtils.getInstructionType(data);
    console.log('received instruction type: ', instructionType, data);
    if (instructionType === InstructionType.ClearDisplay) {
      this.clearDisplay();
    } else if (instructionType === InstructionType.CursorHome) {
      this.cursorPosition = [0, 0];
    } else if (instructionType === InstructionType.EntryModeSet) {
      // data: [0  0  0  0  0  1   I/D   S]
      if (data[6] === '1') {
        this.autoCursorPosition = 1;
      } else if (data[6] === '0') {
        this.autoCursorPosition = -1;
      }
    } else if (instructionType === InstructionType.DisplayOnOff) {
      this.isDisplayOn = !this.isDisplayOn;
    } else if (instructionType === InstructionType.CursorDisplayShift) {
      // TODO: display shift
      // data: [0   0   0   1  S/C R/L  *   * ]
      if (data[5] === '0') {
        this.cursorPosition[1] -= 1;
        if (this.cursorPosition[1] < 0) {
          this.cursorPosition[1] = 0;
        }
      } else if (data[5] === '1') {
        this.cursorPosition[1] += 1;
        if (this.cursorPosition[1] > 40) {
          this.cursorPosition = [this.cursorPosition[0] + 1, 0];
        }
      }
    } else if (instructionType === InstructionType.FunctionSet) {
      // data: [0   0   1   DL  N   F   *   *]
      // TODO: 4-bit data
      console.log('Function set instruction received.')
    }
  }

  eSignalListener(newValue) {
    const prevValue = this.previousEValue;
    if (prevValue > 0 && newValue === 0) {
      this.latchData();
      this.redrawLCD();
    }
    this.previousEValue = newValue;
  }

  redrawLCD() {
    const gridForCanvas: object = _.flatten(Object.values(this.characterPanels).map((panel: LCDCharacterPanel) => panel.getCanvasRepr()));
    this.DrawElement(this.canvas, gridForCanvas);
  }

  /**
   * @param character character in the form of byte array
   * @param cursorPosition cursor position [row, column]
   */
  drawCharacter(characterBinary, cursorPosition) {
    const parentIndex = [...cursorPosition];
    const character = String.fromCharCode(parseInt(characterBinary, 2));
    const displayBytes = LCDUtils.getDisplayBytes(character);

  }

  getCharacterPanel(index: [number, number]): LCDCharacterPanel {
    return this.characterPanels[`${index.join(':')}`];
  }

  init() {
    /**
     * Draws lcd grid (16x2) each containing a block of 8 rows x 5 columns
     */
    let k: number;
    let l: number;
    let tempX: number;
    let tempY: number;
    let tempColumnsY: number;
    let posX = this.data.startX + this.tx;
    let posY = this.data.startY + this.ty;
    for (k = 0; k < this.data.rows; k++) { // Rows: 2
      tempX = posX;
      tempY = posY;
      for (l = 0; l < this.data.columns; l++) { // Columns: 16 (Characters)
        tempColumnsY = posY;
        const characterPanel = new LCDCharacterPanel([k, l], this.data.gridRows, this.data.gridColumns,
                                                      posX, posY, this.data.gridHeight, this.data.gridWidth,
                                                      this.data.barColor, this.data.barGlowColor, this.data.intraSpacing);
        this.characterPanels[characterPanel.index.join(':')] = characterPanel;

        posX = posX + (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
        posY = tempColumnsY;
      }
      posY = tempY + (this.data.gridRows * this.data.gridWidth) + (this.data.interSpacing * 1.5);
      posX = tempX;
    } // Row ends

    this.redrawLCD();
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }

    // adding listeners to E listener
    this.pinNamedMap['E'].addValueListener(this.eSignalListener.bind(this));
  }

  /** Simulation Logic */
  logic(_, node) {
    console.log(node.label, node.value);
    // const db4Value = this.pinNamedMap['DB4'].value;
    // const db5Value = this.pinNamedMap['DB5'].value;
    // const db6Value = this.pinNamedMap['DB6'].value;
    // const db7Value = this.pinNamedMap['DB7'].value;
    // console.log(db4Value, db5Value, db6Value, db7Value);
  }

  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
  }
}
/**
 * SevenSegment Class
 */
export class SevenSegment extends CircuitElement {
  /**
   * The Seven Segment Bar Color
   */
  static barColor: string;
  /**
   * The Seven Segment Bar glow color
   */
  static barGlowColor: string;
  /**
   * The Bar mapping
   */
  static mapping: number[] = [];
  /**
   * Stores list of Raphael Glow elements
   */
  glows = [];
  /**
   * Map of Pin name to Circuit Node
   */
  pinNamedMap: any = {};
  /**
   * SevenSegment constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: any, y: any) {
    super('SevenSegment', x, y, 'SevenSegment.json', canvas);
  }
  /** init is called when the component is completely drawn to the canvas */
  init() {
    if (SevenSegment.mapping.length === 0) {
      SevenSegment.mapping = this.data.mapping;
      SevenSegment.barColor = this.data.barColor;
      SevenSegment.barGlowColor = this.data.barGlowColor;
    }
    for (const value of SevenSegment.mapping) {
      this.elements[value].attr({ fill: SevenSegment.barColor });
      this.glows.push(null);
    }
    // Remove From memory
    this.data.mapping = null;
    this.data.barColor = null;
    this.data.barGlowColor = null;
    this.data = null;
    // let x = 0;
    for (const node of this.nodes) {
      // console.log([x++, node.label]);
      if (node.label !== 'COMMON') {
        this.pinNamedMap[node.label] = node;
        node.addValueListener((v) => this.logic(v));
      }
    }
  }
  /** Simulation Logic */
  logic(_) {
    // console.log(k)
    let byte = 0;
    // create a mapping for node label to node
    byte |= (this.pinNamedMap['a'].value > 0) ? 1 : 0;
    byte |= (this.pinNamedMap['b'].value > 0) ? 2 : 0;
    byte |= (this.pinNamedMap['C'].value > 0) ? 4 : 0;
    byte |= (this.pinNamedMap['d'].value > 0) ? 8 : 0;
    byte |= (this.pinNamedMap['e'].value > 0) ? 16 : 0;
    byte |= (this.pinNamedMap['f'].value > 0) ? 32 : 0;
    byte |= (this.pinNamedMap['g'].value > 0) ? 64 : 0;
    byte |= (this.pinNamedMap['DP'].value > 0) ? 128 : 0;
    // console.log(byte);
    this.animate(byte);
  }
  /** animation caller when start simulation is pressed */
  animate(value: number) {
    value = value & 0xFF;
    for (let i = 0; i < 8; ++i) {
      const x = this.elements[SevenSegment.mapping[i]];
      if (this.glows[i]) {
        this.glows[i].remove();
        this.glows[i] = null;
      }
      if ((value >> i) & 1) {
        x.attr({ fill: SevenSegment.barGlowColor });
        this.glows[i] = x.glow({ color: SevenSegment.barGlowColor, width: 2 });
      } else {
        x.attr({ fill: SevenSegment.barColor });
      }
    }
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
      title: 'Seven Segment Display'
    };
  }
  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
  }
  /** Function removes all  animations */
  closeSimulation(): void {
    this.animate(0);
  }
}
