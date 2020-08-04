import { CircuitElement } from '../CircuitElement';
import {
  DataDisplayState, DataProcessingMode, BitState,
  Font8x5DisplayState, Font10x5DisplayState,
  FourBitState, EightBitState,
  WriteDataProcessingMode, ReadDataProcessingMode,
  RegisterState, DataRegisterState, InstructionRegisterState,
} from './LCD/LCDStates';
import _ from 'lodash';
import { LCDCharacterPanel } from './LCD/LCDPanel';
import { DDRAM, CGROM } from './LCD/MemorySchema';
import { MathUtils } from '../Utils';

enum RegisterType {
  Instruction = 0, Data = 1
}

enum DataMode {
  Write = 0, Read = 1
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

  previousEValue = 0;

  isDisplayOn = false;

  autoCursorShift = 0;

  autoDisplayShift = 0;

  /**
   * 2-D Array of 8-bit characters representing DDRAM of the LCD
   */
  ddRam: DDRAM;

  /**
   * 3-D array of character font:
   * higher-bit -> lower-bit -> characterFont
   */
  cgRom: CGROM;

  /**
   * Map from character panel index to character panel
   */
  characterPanels: {[key: string]: LCDCharacterPanel} = {};

  /**
   * Data processing mode of LCD: Read/Write
   */
  dataProcessingMode: DataProcessingMode;

  /**
   * Write Data processing concrete object
   */
  writeDataMode: WriteDataProcessingMode;

  /**
   * Read Data processing concrete object
   */
  readDataMode: ReadDataProcessingMode;

  /**
   * Bit state of LCD: 4-bit/8-bit
   */
  bitState: BitState;

  /**
   * Concrete 4-bit state
   */
  fourBitState: FourBitState;

  /**
   * Concrete 8-bit state
   */
  eightBitState: EightBitState;

  /**
   * Data display state of LCD: Font 10x5 vs 10x8
   */
  dataDisplayState: DataDisplayState;

  /**
   * Concrete data display state for 8x5 fonts
   */
  font8x5DisplayState: Font8x5DisplayState;

  /**
   * Concrete data display state for 10x5 fonts
   */
  font10x5DisplayState: Font10x5DisplayState;

  /**
   * Register state of the LCD
   */
  registerState: RegisterState;

  /**
   * Data Register state's concrete class
   */
  dataRegisterState: DataRegisterState;

  /**
   * Instruction register state's concrete class
   */
  instructionRegisterState: InstructionRegisterState;

  /**
   * Start index (left-top) of the DDROM being displayed on the LCF
   */
  displayStartIndex: [number, number] = [0, 0];

  /**
   * End index (right-bottom) of the DDROM being displayed on the LCF
   */
  displayEndIndex: [number, number];

  currentPixels: Set<any> = new Set();

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

  loadRegisterState(): void {
    const registerType = this.getRegisterType();
    this.registerState = registerType === RegisterType.Data ? this.dataRegisterState : this.instructionRegisterState;
  }

  loadDataMode(): void {
    const dataMode = this.getDataMode();
    this.dataProcessingMode = dataMode === DataMode.Read ? this.readDataMode : this.writeDataMode;
  }

  getDataMode(): DataMode {
    return this.pinNamedMap['RW'].value & 1;
  }

  moveCursorRight() {
    this.cursorPosition[1] += 1;
    if (this.cursorPosition[1] >= this.ddRam.N_COLUMN) {
      this.cursorPosition = [this.cursorPosition[0] + 1, 0];
    }
  }

  moveCursorLeft() {
    this.cursorPosition[1] -= 1;
    if (this.cursorPosition[1] < 0) {
      this.cursorPosition[1] = 0;
    }
  }

  isInSight(index: [number, number]) {
    return MathUtils.isPointBetween(index, this.displayStartIndex, this.displayEndIndex);
  }

  shiftDisplay(numSteps: number, stepSize: number) {
    for (const characterPanel of Object.values(this.characterPanels)) {
      const oldColumnIndex = characterPanel.displayIndex[1];
      const newColumnIndex = MathUtils.modulo(oldColumnIndex - numSteps, this.ddRam.N_COLUMN);
      characterPanel.displayIndex[1] = newColumnIndex;

      characterPanel.hidden  = !this.isInSight(characterPanel.displayIndex);
      characterPanel.shift((newColumnIndex - oldColumnIndex) * stepSize);
    }
  }

  scrollDisplayLeft() {
    const singleStep = (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
    this.shiftDisplay(-1, singleStep);
  }

  scrollDisplayRight() {
    const singleStep = (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
    this.shiftDisplay(1, singleStep);
  }

  getCharacterPanel(index) {
    return this.characterPanels[`${index[0]}:${index[1]}`];
  }

  clearDisplay() {
    Object.values(this.characterPanels).forEach((panel: LCDCharacterPanel) => panel.clear());
  }

  eSignalListener(newValue) {
    const prevValue = this.previousEValue;

    // identifying high-low pulse
    if (prevValue > 0 && newValue === 0) {
      this.loadRegisterState();
      this.loadDataMode();
      this.dataProcessingMode.processData();
      this.refreshLCD();
    }
    this.previousEValue = newValue;
  }

  /**
   * Get set of panels which are in the view of LCD
   */
  getDisplayablePanels(): Set<LCDCharacterPanel> {
    const result = new Set<LCDCharacterPanel>();
    for (const characterPanel of Object.values(this.characterPanels)) {
      if (MathUtils.isPointBetween(characterPanel.displayIndex, this.displayStartIndex, this.displayEndIndex)) {
        result.add(characterPanel);
      }
    }
    return result;
  }

  refreshLCD() {
    const displayablePanels = this.getDisplayablePanels();
    for (const panel of Object.values(this.characterPanels)) {
      const show = displayablePanels.has(panel);
      for (const pixel of _.flatten(panel.pixels)) {
        if (pixel.canvas) {
          pixel.refresh();
        } else {
          pixel.canvas = this.DrawElement(this.canvas, [pixel.getCanvasRepr()])[0];
          pixel.canvas.transform(`t${this.tx},${this.ty}`);
          if (!show) {
            pixel.hide();
          }
        }
      }
    }
  }

  /**
   * @param bitState new bit state
   */
  setBitState(bitState: BitState) {
    this.bitState = bitState;
  }

  /**
   * @param dataDisplayState new data display state
   */
  setDataDisplayState(dataDisplayState: DataDisplayState) {
    this.dataDisplayState = dataDisplayState;
  }

  /**
   * @param dataProcessingMode new data processing mode
   */
  setDataProcessingMode(dataProcessingMode: DataProcessingMode) {
    this.dataProcessingMode = dataProcessingMode;
  }

  init() {
    /**
     * Draws lcd grid (16x2) each containing a block of 8 rows x 5 columns
     */
    // Setting cursor to home
    this.cursorPosition = [0, 0];

    // Initialising data display state
    this.font8x5DisplayState = new Font8x5DisplayState(this);
    this.font10x5DisplayState = new Font10x5DisplayState(this);
    this.dataDisplayState = this.font8x5DisplayState;

    // Initialising data processing state
    this.readDataMode = new ReadDataProcessingMode(this);
    this.writeDataMode = new WriteDataProcessingMode(this);
    this.dataProcessingMode = this.readDataMode;

    // Initialising bit mode state
    this.fourBitState = new FourBitState(this);
    this.eightBitState = new EightBitState(this);
    this.bitState = this.eightBitState;

    // Initialising register state
    this.dataRegisterState = new DataRegisterState(this);
    this.instructionRegisterState = new InstructionRegisterState(this);
    this.registerState = this.instructionRegisterState;

    // Setting display start and end indices
    this.displayStartIndex = [0, 0];
    this.displayEndIndex = [this.data.rows, this.data.columns];

    // Initialising CGROM and DDRAM
    this.cgRom = new CGROM(this.dataDisplayState.getFontSize());
    this.ddRam = DDRAM.createDDRAMForLCD(this.data.rows);

    let tempX: number;
    let tempY: number;
    let tempColumnsY: number;
    let posX = this.data.startX;
    let posY = this.data.startY;

    for (let k = 0; k < this.ddRam.N_ROW; k++) { // Rows: 2
      tempX = posX;
      tempY = posY;
      for (let l = 0; l < this.ddRam.N_COLUMN; l++) { // Columns: 16 (Characters)
        tempColumnsY = posY;
        const hidden = k >= this.data.rows || l >= this.data.columns;
        const characterPanel = new LCDCharacterPanel([k, l], this.data.gridRows, this.data.gridColumns,
                                                      posX, posY, this.x, this.y, this.data.gridHeight, this.data.gridWidth,
                                                      this.data.barColor, this.data.barGlowColor, this.data.intraSpacing,
                                                      this.displayStartIndex, this.displayEndIndex, [k, l], hidden);
        this.characterPanels[characterPanel.index.join(':')] = characterPanel;

        posX = posX + (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
        posY = tempColumnsY;
      }
      posY = tempY + (this.data.gridRows * this.data.gridWidth) + (this.data.interSpacing * 1.5);
      posX = tempX;
    } // Row ends

    this.refreshLCD();

    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }

    // adding listeners to E listener
    this.pinNamedMap['E'].addValueListener(this.eSignalListener.bind(this));
  }

  /** Simulation Logic */
  logic(_, node) {
    // console.log(node.label, node.value);
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
    // this.elements.remove();
    this.init();
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
