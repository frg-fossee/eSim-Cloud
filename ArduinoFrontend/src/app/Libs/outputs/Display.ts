import { CircuitElement } from '../CircuitElement';
import {
  DataDisplayState, DataProcessingMode, BitState,
  Font8x5DisplayState, Font10x5DisplayState,
  FourBitState, EightBitState,
  WriteDataProcessingMode, ReadDataProcessingMode,
  RegisterState, DataRegisterState, InstructionRegisterState,
  ActiveAddress, RegisterType, DataMode,
} from './LCD/LCDStates';
import { LCDCharacterPanel } from './LCD/LCDPanel';
import { DDRAM, CGROM, CGRAM, RAM } from './LCD/MemorySchema';
import { MathUtils } from '../MathUtils';
import { ArduinoUno } from './Arduino';
import { BoundingBox } from '../Geometry';
import { Point } from '../Point';
import { BreadBoard } from '../General';

/**
 * LCD16X2 Class
 */
export class LCD16X2 extends CircuitElement {
  /**
   * The Connected Arduino
   */
  arduino: CircuitElement = null;

  /**
   * Variable to state if the LCD is connected properly or not.
   */
  connected = true;

  /**
   * Map of pin name to Circuit Node
   */
  pinNamedMap: any = {};

  /**
   * Previous value at the `E` node
   */
  previousEValue = 0;

  /**
   * Previous value at `V0` node
   */
  previousV0Value = 0;

  isDisplayOn = false;

  isCursorOn = false;

  isCursorPositionCharBlinkOn = false;

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
   * 64-byte CGRAM
   */
  cgRam: CGRAM;

  /**
   * Address of the DDRAM
   */
  ddRamAddress: number;

  /**
   * Address of the CGRAM
   */
  cgRamAddress: number;

  /**
   * Current Active address
   */
  activeAddress: ActiveAddress;

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

  /**
   * Busy flag of the lcd
   */
  busyFlag = false;

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

  /**
   * Returns the bounding box for the LCD
   */
  getBoundingBox(): BoundingBox {
    const lcdImageElement = this.elements.items.find(el => el.type === 'image')[0];
    const lcdBBox = lcdImageElement.getBBox();
    lcdBBox.x += this.tx;
    lcdBBox.y += this.ty;
    return BoundingBox.loadFromRaphaelBbox(lcdBBox);
  }

  /**
   * Turns on/off the display
   * @param isDisplayOn true for switching on, false for off
   */
  setDisplayOn(isDisplayOn: boolean) {
    this.isDisplayOn = isDisplayOn;
  }

  /**
   * Turns on/off the cursor
   * @param isCursorOn true for switching on, false for off
   */
  setCursorOn(isCursorOn: boolean) {
    this.isCursorOn = isCursorOn;
  }

  /**
   * Sets cursor blink on/off
   * @param isCursorPositionCharBlinkOn true for switching on, false for off
   */
  setCursorPositionCharBlink(isCursorPositionCharBlinkOn: boolean) {
    this.isCursorPositionCharBlinkOn = isCursorPositionCharBlinkOn;
  }

  /**
   * Sets address of the DDRAM
   * @param address new address for the DDRAM
   */
  setDdRamAddress(address): void {
    this.ddRamAddress = address;
  }

  /**
   * Gets the voltage input at VCC node
   */
  getVCC(): number {
    return this.pinNamedMap['VCC'].value;
  }

  /**
   * Gets the voltage input at GND node
   */
  getGND(): number {
    return this.pinNamedMap['GND'].value;
  }

  /**
   * Gets the voltage input at V0 node
   */
  getV0(): number {
    return this.pinNamedMap['V0'].value;
  }

  /**
   * Gets the current register type of the lcd
   */
  getRegisterType(): RegisterType {
    return this.pinNamedMap['RS'].value & 1;
  }

  /**
   * Gets the data mode of the lcd
   */
  getDataMode(): DataMode {
    return this.pinNamedMap['RW'].value & 1;
  }

  /**
   * Updates the registerState to sync it with the value at node 'RS'
   */
  private loadRegisterState(): void {
    const registerType = this.getRegisterType();
    this.registerState = registerType === RegisterType.Data ? this.dataRegisterState : this.instructionRegisterState;
  }

  /**
   * Updates the dataProcessingMode to sync it with the value at node 'RW'
   */
  private loadDataMode(): void {
    const dataMode = this.getDataMode();
    this.dataProcessingMode = dataMode === DataMode.Read ? this.readDataMode : this.writeDataMode;
  }

  private setBusyFlag(value: boolean): void {
    this.busyFlag = value;
  }

  /**
   * Gets the active ram and its address
   * An LCD can have either CGRAM or DDRAM active while reading/writing the data.
   */
  getActiveRamAndAddress(): [RAM, number] {
    if (this.activeAddress === ActiveAddress.CGRAM) {
      return [this.cgRam, this.cgRamAddress];
    }
    return [this.ddRam, this.ddRamAddress];
  }

  /**
   * Gets the chacracter panel at the current DDRAM address
   */
  getCurrentCharacterPanel() {
    return this.getCharacterPanel(this.ddRamAddress);
  }

  /**
   * Moves the address of the CGRAM
   * @param distance distance by which to move the address
   */
  moveCgRamAddress(distance: number) {
    this.cgRamAddress += distance;
  }

  /**
   * Moves cursor by one step in either left/right direction
   * @param direction direction of the movement, 1 for right, -1 for left
   */
  moveCursor(direction: 1 | -1) {
    let newDdRamAddress = this.ddRamAddress + direction;

    // applying max value condition
    newDdRamAddress = Math.min(0x67, newDdRamAddress);

    // applying min value condition
    newDdRamAddress = Math.max(0x00, newDdRamAddress);

    // applying [0x27, 0x40] condition
    if (newDdRamAddress > 0x27 && newDdRamAddress < 0x40) {
      newDdRamAddress = direction > 0 ? 0x40 : 0x27;
    }

    this.setDdRamAddress(newDdRamAddress);
  }

  /**
   * Checks if a character panel with displayIndex `index` is in sight of the LCD or not
   * @param index index to check
   */
  private isInSight(index: [number, number]) {
    return MathUtils.isPointBetween(index, this.displayStartIndex, this.displayEndIndex);
  }

  /**
   * Shifts the display with `numSteps` steps
   * @param numSteps number of steps to move the display with
   */
  private shiftDisplay(numSteps: number) {
    const stepSize = this.getInterSpacingHorizontal();
    for (const characterPanel of Object.values(this.characterPanels)) {
      const oldColumnIndex = characterPanel.displayIndex[1];
      const newColumnIndex = MathUtils.modulo(oldColumnIndex - numSteps, this.ddRam.N_COLUMN);
      characterPanel.displayIndex[1] = newColumnIndex;

      characterPanel.hidden  = !this.isInSight(characterPanel.displayIndex);
      characterPanel.shift((newColumnIndex - oldColumnIndex) * stepSize);
    }
  }

  /**
   * Scrolls the display to one step left
   */
  scrollDisplayLeft() {
    this.shiftDisplay(-1);
  }

  /**
   * Scrolls the display to one step right
   */
  scrollDisplayRight() {
    this.shiftDisplay(1);
  }

  /**
   * Gets the character panel at the given ddram address
   * @param address ddRam address
   */
  getCharacterPanel(address) {
    // converting address to [i, j]
    const index = this.ddRam.convertAddressToIndex(address);
    return this.characterPanels[`${index[0]}:${index[1]}`];
  }

  /**
   * Clears the display of the lcd
   */
  clearDisplay() {
    Object.values(this.characterPanels).forEach((panel: LCDCharacterPanel) => panel.clear());
  }

  /**
   * event listener for node 'V0
   * @param newValue new value at node 'V0'
   * @param prevValue previous value at node 'V0'
   */
  v0Listener(newValue, prevValue) {
    if (prevValue !== newValue) {
      let newContrast = newValue / 500 * 100;

      // bounding the value between 0 and 100
      newContrast = Math.min(100, newContrast);
      newContrast = Math.max(0, newContrast);
      Object.values(this.characterPanels).forEach(panel => panel.setContrast(newContrast));
    }
  }

  /**
   * Checks if power supply is enough
   */
  isPowerSupplyEnough() {
    const vcc = this.getVCC();
    if (vcc < 3.3 || vcc > 5) {
      return false;
    }
    return true;
  }

  /**
   * event listener for node `E`
   * @param newValue new value at the node `E`
   */
  eSignalListener(newValue) {
    if (!this.isPowerSupplyEnough()) {
      console.log('Not enough power supply.');
      return;
    }

    this.setBusyFlag(true);

    const prevValue = this.previousEValue;

    // identifying high-low pulse
    if (prevValue > 0 && newValue === 0) {
      this.loadRegisterState();
      this.loadDataMode();
      this.dataProcessingMode.processData();
      this.refreshLCD();
    }
    this.previousEValue = newValue;
    this.setBusyFlag(false);
  }

  /**
   * Get set of panels which are in the view of the LCD
   */
  getDisplayablePanels(): Set<LCDCharacterPanel> {
    const filteredPanels = Object.values(this.characterPanels)
                                .filter(panel =>
                                  MathUtils.isPointBetween(panel.displayIndex, this.displayStartIndex, this.displayEndIndex
                                ));
    return new Set(filteredPanels);
  }

  /**
   * Refreshs LCD to take in account recent changes
   */
  refreshLCD() {
    const displayablePanels = this.getDisplayablePanels();
    for (const panel of Object.values(this.characterPanels)) {
      const show = displayablePanels.has(panel);
      const address = this.ddRam.convertIndexToAddress(panel.index);

      // turning cursor on and off
      panel.changeCursorDisplay(false);
      panel.setBlinking(false);

      if (this.isCursorOn) {
        if (this.ddRamAddress === address) {
          if (this.isCursorPositionCharBlinkOn) {
            panel.setBlinking(true);
          }
          panel.changeCursorDisplay(true);
        }
      }

      // refreshing canvas of all the pixels
      panel.pixels.forEach(pixelRow => pixelRow.forEach(pixel => {
        if (pixel.canvas) {
          pixel.refresh();
        } else {
          pixel.canvas = this.DrawElement(this.canvas, [pixel.getCanvasRepr()])[0];
          pixel.canvas.transform(`t${this.tx},${this.ty}`);
          if (!show) {
            pixel.hide();
          }
        }
      }));
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
  setDataDisplayState(dataDisplayState: DataDisplayState, numLines?: number) {
    this.dataDisplayState = dataDisplayState;
    if (numLines) {
      this.dataDisplayState.setNLines(numLines);
    }
    this.createDdRam();
    this.createCgRom();
    this.generateCharacterPanels();
  }

  /**
   * @param dataProcessingMode new data processing mode
   */
  setDataProcessingMode(dataProcessingMode: DataProcessingMode) {
    this.dataProcessingMode = dataProcessingMode;
  }

  /**
   * Returns the horizontal spacing between two consecutive character panels
   */
  getInterSpacingHorizontal() {
    return (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
  }

  /**
   * Returns the vertical spacing between two consecutive character panels
   */
  getInterSpacingVertical() {
    return (this.data.gridRows * this.data.gridWidth) + (this.data.interSpacing * 1.5);
  }

  /**
   * Resets the lcd by initializing all the variables
   */
  reset() {

    this.isDisplayOn = false;
    this.isCursorOn = false;
    this.isCursorPositionCharBlinkOn = false;

    // Initialising data display state
    this.font8x5DisplayState = new Font8x5DisplayState(this, 2);
    this.font10x5DisplayState = new Font10x5DisplayState(this, 1);
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

    // Initialising CGROM, DDRAM, and CGRAM
    this.createCgRom();
    this.createDdRam();
    this.setDdRamAddress(0x00);
    this.cgRam = new CGRAM();

    this.clearDisplay();
    this.setDisplayToHome();
    this.refreshLCD();
  }

  /**
   * Sets the display to home position
   */
  setDisplayToHome() {
    // shifting panels to their original position
    const panel00 = this.characterPanels['0:0'];
    if (!panel00) {
      return;
    }

    const offset = panel00.displayIndex[1] - panel00.index[1];
    this.shiftDisplay(offset);
  }

  /**
   * Generates the DDRAM for the LCD
   */
  createDdRam() {
    this.ddRam = DDRAM.createDDRAMForLCD(this.dataDisplayState.getRows());
  }

  /**
   * Generates the CGROM for the LCD
   */
  createCgRom() {
    this.cgRom = new CGROM(this.dataDisplayState.getFontSize());
  }

  /**
   * Generates character panels inside the lcd
   */
  generateCharacterPanels() {
    this.destroyCharacterPanels();

    const posX = this.data.startX;
    const posY = this.data.startY;

    // Getting the number of pixel/panel rows, columns from the active data display state
    const gridRows = this.dataDisplayState.getPixelRows();
    const gridColumns = this.dataDisplayState.getPixelColumns();
    const rows = this.dataDisplayState.getRows();
    const columns = this.dataDisplayState.getColumns();

    for (let k = 0; k < this.ddRam.N_ROW; k++) { // Rows: 1
      for (let l = 0; l < this.ddRam.N_COLUMN; l++) { // Columns: 16 (Characters)
        const panelPosX = posX + l * this.getInterSpacingHorizontal();
        const panelPosY = posY + k * this.getInterSpacingVertical();

        const hidden = k >= rows || l >= columns;
        const characterPanel = new LCDCharacterPanel([k, l], gridRows, gridColumns, panelPosX, panelPosY, this.x, this.y,
                                                      this.data.gridHeight, this.data.gridWidth,
                                                      this.data.barColor, this.data.barGlowColor, this.data.intraSpacing,
                                                      [k, l], hidden, 100);
        this.characterPanels[characterPanel.index.join(':')] = characterPanel;
      }
    } // Row ends
  }

  /**
   * destroys all the character panels
   */
  destroyCharacterPanels() {
    Object.values(this.characterPanels).forEach(panel => panel.destroy());
  }

  init() {
    /**
     * Draws lcd grid (16x2) each containing a block of 8 rows x 5 columns
     */

    // Resets the lcd's properties
    this.reset();

    // Refreshes the LCD
    this.refreshLCD();

    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }

    // adding listeners to E listener
    this.pinNamedMap['E'].addValueListener(this.eSignalListener.bind(this));
    // this.pinNamedMap['V0'].addValueListener(this.v0Listener.bind(this));
  }

  /** Simulation Logic */
  logic(_, node) {
    // console.log(node.label, node.value);
  }

  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
    // Generates the character panels
    this.generateCharacterPanels();

    // Get the V0 pin
    let connectedPin: Point = null;
    const v0Pin = this.nodes[2];

    if (!v0Pin.connectedTo) {
      window['showToast']('V0 pin of the LCD is not connected to power source.');
      return;
    }

    const v0wire = v0Pin.connectedTo;
    connectedPin = v0wire.start.parent === this ? v0wire.end : v0wire.start;

    // finding the arduino connected to the LCD to start PWM
    if (connectedPin.parent.keyName === 'ArduinoUno') {
      this.arduino = connectedPin.parent;
    } else if (connectedPin.parent.keyName === 'BreadBoard') {
      const breadboard = connectedPin.parent as BreadBoard;

      const connectedRow = connectedPin.label.charCodeAt(0);
      const isConnectedRowInFirstBlock = connectedRow <= 101;

      // checking for all the nodes with the same x-coordinate
      for (const neighbor of breadboard.sameXNodes[connectedPin.x]) {
        const neighborRow = neighbor.label.charCodeAt(0);
        const isSameBlock = neighborRow <= 101 === isConnectedRowInFirstBlock;

        if (neighbor.y !== connectedPin.y && isSameBlock) {
          if (neighbor.connectedTo) {
            let arduinoPin = null;

            if (neighbor.connectedTo.start.parent.keyName === 'ArduinoUno') {
              arduinoPin = neighbor.connectedTo.start;
            } else if (neighbor.connectedTo.end.parent.keyName === 'ArduinoUno') {
              arduinoPin = neighbor.connectedTo.end;
            }

            if (arduinoPin) {
              this.arduino = arduinoPin.parent;
              connectedPin = arduinoPin;
              this.connected = true;
              break;
            }
          }
        }
      }
    }

    // Add PWM event on arduino
    (this.arduino as ArduinoUno).addPWM(connectedPin, this.v0Listener.bind(this));

  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
    // this.elements.remove();
    this.arduino = null;
    this.reset();
    this.destroyCharacterPanels();
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
