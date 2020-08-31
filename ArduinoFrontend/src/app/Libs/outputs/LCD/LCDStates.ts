import { LCDCharacterPanel } from './LCDPanel';
import { LCD16X2 } from '../Display';
import { InstructionType, FontSize } from './LCDUtils';

export enum ActiveAddress {
  CGRAM = 0, DDRAM = 1
}

/**
 * Register type enum for the LCD
 */
export enum RegisterType {
  Instruction = 0, Data = 1
}

/**
 * DataMode type enum for the LCD
 */
export enum DataMode {
  Write = 0, Read = 1
}

/**
 * Data processor interface
 */
export interface DataProcessingMode {
    processData: () => void;
}

/**
 * Data processor for write mode
 */
export class WriteDataProcessingMode implements DataProcessingMode {
  lcd: LCD16X2;

  processData() {
    this.lcd.registerState.processData();
  }

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }
}

/**
 * Data processor for read mode
 */
export class ReadDataProcessingMode implements DataProcessingMode {
  lcd: LCD16X2;

  processData() {
    // if (this.lcd.getRegisterType() === RegisterType)
    console.log('Read data processing.');
  }

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }
}

/**
 * Bit state interface
 */
export interface BitState {
    /**
     * returns [higherBits, lowerBits]
     */
    readData: () => [number, number];
    writeData: () => void;
    isWaitingForMoreData: () => boolean;
}

/**
 * 4-bit state
 */
export class FourBitState implements BitState {

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
    this.waitingForData = false;
  }

  /**
   * LCD object
   */
  lcd: LCD16X2;

  /**
   * is waiting for more data to come?
   */
  waitingForData: boolean;

  /**
   * temporary variable to store the higher bits read before the data-waiting state
   */
  higherBits = -1;

  writeData: () => void;

  /**
   * Reads the data from the databuses
   */
  readData(): [number, number] {
    let data = 0;

    for (let i = 7; i >= 4; i--) {
      data |= (this.lcd.pinNamedMap[`DB${i}`].value > 0 ? 1 : 0);
      data = data << 1;
    }
    data = data >> 1;

    if (this.waitingForData) {
      // if the state was earlier waiting for more data,
      // return the complete data now
      this.waitingForData = false;
      return [this.higherBits, data];
    }

    // if the state was not in data-waiting state,
    // now since it has received first set of 4 bits
    // move it to the waiting state and store the higher bits
    this.higherBits = data;
    this.waitingForData = true;
    return [-1, -1];
  }

  /**
   * Returns if the state is waiting for more data
   */
  isWaitingForMoreData() {
    return this.waitingForData;
  }
}

/**
 * 8-bit state
 */
export class EightBitState implements BitState {

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }

  /**
   * LCD object
   */
  lcd: LCD16X2;

  writeData: () => void;

  /**
   * Reads the data from the databuses
   */
  readData(): [number, number] {
    let data = 0;

    for (let i = 7; i >= 0; i--) {
      data |= (this.lcd.pinNamedMap[`DB${i}`].value > 0 ? 1 : 0);
      data = data << 1;
    }
    data = data >> 1;

    // returns "<DB7><DB6><DB5>...<DB0>" parsed in binary format
    return [(data >> 4) & 0b1111, data & 0b1111];
  }

  /**
   * Returns if the state is waiting for more data
   */
  isWaitingForMoreData() {
    // 8-bit mode never goes in to data-waiting mode,
    // hence returning false
    return false;
  }
}

/**
 * Data display interface
 */
export interface DataDisplayState {
  displayData: (characterDisplayBytes: number[][]) => void;
  getFontSize: () => FontSize;
  getPixelRows: () => number;
  getPixelColumns: () => number;
  getRows: () => number;
  getColumns: () => number;
  setNLines: (nLines: number) => void;
}

/**
 * Font8x5 display class
 */
export class Font8x5DisplayState implements DataDisplayState {
  /**
   * Map of character panel's name to the character panel
   */
  characterPanels: any = {};

  /**
   * LCD object
   */
  lcd: LCD16X2;

  /**
   * Number of lines in the lcd
   */
  nLines: number;

  constructor(lcd: LCD16X2, nLines: number) {
    this.lcd = lcd;
    this.nLines = nLines;
  }

  // TODO: To implement the following 4 functions for different size LCDs
  // Currently it's only for 16x2 LCD

  /**
   * Returns the number of pixels' rows inside the character panel
   */
  getPixelRows() {
    return 8;
  }
  /**
   * Returns the number of pixels' columns inside the character panel
   */
  getPixelColumns() {
    return 5;
  }

  /**
   * Returns the number of character panel's rows inside the lcd
   */
  getRows() {
    return this.nLines;
  }

  /**
   * Returns the number of character panel's columns inside the lcd
   */
  getColumns() {
    return 16;
  }

  /**
   * Sets the number of lines on the lcd
   * @param nLines number of lines
   */
  setNLines(nLines: number) {
    if (this.nLines !== nLines) {
      this.nLines = nLines;
    }
  }

  /**
   * Returns font size of the state
   */
  getFontSize() {
    return FontSize._8x5;
  }

  /**
   * Displays the input data on the panel located at current ddram address of the lcd
   * @param characterDisplayBytes array of bytes to be displayed on the current panel
   */
  displayData(characterDisplayBytes: number[][]) {
    if (!this.lcd.isDisplayOn) {
      return;
    }

    const currentPanel = this.lcd.getCurrentCharacterPanel();
    currentPanel.drawCharacter(characterDisplayBytes);
  }
}

/**
 * Font10x5 display class
 */
export class Font10x5DisplayState implements DataDisplayState {
  /**
   * Map of character panel's name to the character panel
   */
  characterPanels: any = {};

  /**
   * LCD object
   */
  lcd: LCD16X2;

  /**
   * Number of lines in the lcd
   */
  nLines: number;

  constructor(lcd: LCD16X2, nLines: number) {
    this.lcd = lcd;
    this.nLines = nLines;
  }

  setNLines(nLines: number) {
    if (this.nLines !== nLines) {
      this.nLines = nLines;
    }
  }

  // TODO: To implement the following 4 functions for different size LCDS
  // Currently it's only for 16x2 LCD

  /**
   * Returns the number of pixels' rows inside the character panel
   */
  getPixelRows() {
    return 10;
  }
  /**
   * Returns the number of pixels' columns inside the character panel
   */
  getPixelColumns() {
    return 5;
  }

  /**
   * Returns the number of character panel's rows inside the lcd
   */
  getRows() {
    return this.nLines;
  }

  /**
   * Returns the number of character panel's columns inside the lcd
   */
  getColumns() {
    return 16;
  }

  /**
   * Returns font size of the state
   */
  getFontSize() {
    return FontSize._10x5;
  }

  /**
   * Displays the input data on the panel located at current ddram address of the lcd
   * @param characterDisplayBytes array of bytes to be displayed on the current panel
   */
  displayData(characterDisplayBytes: number[][]) {
    if (!this.lcd.isDisplayOn) {
      return;
    }

    const currentPanel = this.lcd.getCurrentCharacterPanel();
    currentPanel.drawCharacter(characterDisplayBytes);
  }

}

export interface RegisterState {
  lcd: LCD16X2;
  processData: () => void;
}

export class DataRegisterState implements RegisterState {
  lcd: LCD16X2;

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }

  processData() {
    const [higherBits, lowerBits] = this.lcd.bitState.readData();
    const waitingForData = this.lcd.bitState.isWaitingForMoreData();
    if (waitingForData) {
      return;
    }
    const characterBits = (higherBits << 4) | lowerBits;

    const [activeRam, address] = this.lcd.getActiveRamAndAddress();
    activeRam.write(address, characterBits);

    if (this.lcd.activeAddress === ActiveAddress.DDRAM) {
      let characterDisplayBytes = [];
      // when writing to DDRAM
      if (higherBits === 0) {
        for (let i = 0; i < 8; i++) {
          characterDisplayBytes.push(this.lcd.cgRam.read(0x40 + (lowerBits * 8) + i));
        }
      } else {
        characterDisplayBytes = this.lcd.cgRom.readROM(higherBits, lowerBits);
      }
      this.lcd.dataDisplayState.displayData(characterDisplayBytes);

      if (this.lcd.autoCursorShift) {
        // move cursor to right
        this.lcd.moveCursor(1);
        if (this.lcd.autoDisplayShift) {
          this.lcd.scrollDisplayRight();
        }
      } else {
        // move cursor to left
        this.lcd.moveCursor(-1);
        if (this.lcd.autoDisplayShift) {
          this.lcd.scrollDisplayLeft();
        }
      }
    }

    if (this.lcd.autoCursorShift) {
      this.lcd.moveCgRamAddress(1);
    } else {
      this.lcd.moveCgRamAddress(-1);
    }
  }
}

export class InstructionRegisterState implements RegisterState {
  lcd: LCD16X2;

  static getInstructionType(databus: number): InstructionType {
    const dataBusBinary = Number(databus).toString(2);
    let firstOnePositionFromLeft = -1;
    for (let i = 0; i < dataBusBinary.length; i++) {
        if (dataBusBinary[i] === '1') {
            firstOnePositionFromLeft = i;
            break;
        }
    }
    const firstOnePositionFromRight = dataBusBinary.length - firstOnePositionFromLeft;
    return firstOnePositionFromRight;
  }

  clearDisplay() {
    this.lcd.clearDisplay();
  }

  setCursorHome() {
    this.lcd.setDdRamAddress(0x00);
    this.lcd.setDisplayToHome();
  }

  setEntryMode(data) {
    // data: [0  0  0  0  0  1   I/D   S]
    // Reading I/D
    const iSlashD = (data >> 1) & 1;
    if (iSlashD) {
      this.lcd.autoCursorShift = 1;
    } else {
      this.lcd.autoCursorShift = -1;
    }

    // Reading S
    const S = data & 1;
    if (S) {
      this.lcd.autoDisplayShift = 1;
    }
  }

  displayOnOff(data) {
    const displayOnOff = (data >> 2) & 1;
    this.lcd.setDisplayOn(displayOnOff && true);

    const cursorOnOff = (data >> 1) & 1;
    this.lcd.setCursorOn(cursorOnOff && true);

    const blinkCursorPositionCharacter = data & 1;
    this.lcd.setCursorPositionCharBlink(blinkCursorPositionCharacter && true);
  }

  shiftCursorAndDisplay(data) {
      // TODO: display shift
      // data: [0   0   0   1  S/C R/L  *   * ]
      const rSlashL = (data >> 2) & 1;
      const sSlashC = (data >> 3) & 1;

      if (!(rSlashL & 1)) {
        this.lcd.moveCursor(-1);
        if (sSlashC & 1) {
          this.lcd.scrollDisplayLeft();
        }
      } else if (rSlashL & 1) {
        this.lcd.moveCursor(1);
        if (sSlashC & 1) {
          this.lcd.scrollDisplayRight();
        }
      }
  }

  setFunction(data) {
    // 0   0   0   0   1   DL  N   F   *   *
    const dataLength = (data >> 4) & 1;
    if (dataLength & 1) {
      this.lcd.setBitState(this.lcd.eightBitState);
    } else {
      this.lcd.setBitState(this.lcd.fourBitState);
    }

    const numLines = (data >> 3) & 1;
    const characterFont = (data >> 2) & 1;

    if (numLines & 1) {
      // N = 1 => 2 lines
      this.lcd.setDataDisplayState(this.lcd.font8x5DisplayState, 2);
    } else {
      // N = 0 => 1 line
      if (characterFont & 1) {
        // F = 1 => 10x5
        this.lcd.setDataDisplayState(this.lcd.font10x5DisplayState, 1);
      } else {
        // F = 0 => 8x5
        this.lcd.setDataDisplayState(this.lcd.font8x5DisplayState, 1);
      }
    }
  }

  setCGRAMAddress(data) {
    this.lcd.cgRamAddress = 0x40 + (data & 0x3F);
    this.lcd.activeAddress = ActiveAddress.CGRAM;
  }

  setDDRAMAddress(data) {
    this.lcd.setDdRamAddress(data & 0x7F);
    this.lcd.activeAddress = ActiveAddress.DDRAM;
  }

  processData() {
    const [higherBits, lowerBits] = this.lcd.bitState.readData();
    const waitingForData = this.lcd.bitState.isWaitingForMoreData();
    if (waitingForData) {
      return;
    }
    // console.log('higher, lower bits:', higherBits.toString(2), lowerBits.toString(2));

    const data = (higherBits << 4) | lowerBits;
    const instructionType = InstructionRegisterState.getInstructionType(data);

    // console.log('received instruction type: ', InstructionType[instructionType], data.toString(2));

    const functionToCall = {
      [InstructionType.ClearDisplay]: this.clearDisplay,
      [InstructionType.CursorHome]: this.setCursorHome,
      [InstructionType.EntryModeSet]: this.setEntryMode,
      [InstructionType.DisplayOnOff]: this.displayOnOff,
      [InstructionType.CursorDisplayShift]: this.shiftCursorAndDisplay,
      [InstructionType.FunctionSet]: this.setFunction,
      [InstructionType.SetCGRAMAddress]: this.setCGRAMAddress,
      [InstructionType.SetDDRAMAddress]: this.setDDRAMAddress,
    }[instructionType].bind(this);

    functionToCall(data);
  }

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }
}
