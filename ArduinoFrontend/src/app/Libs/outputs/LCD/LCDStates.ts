import { LCDCharacterPanel } from './LCDPanel';
import { LCD16X2 } from '../Display';
import { InstructionType, FontSize } from './LCDUtils';

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
  lcd: LCD16X2;
  waitingForData: boolean;
  higherBits = -1;

  readData(): [number, number] {
    let data = 0;

    for (let i = 7; i >= 4; i--) {
      data |= (this.lcd.pinNamedMap[`DB${i}`].value > 0 ? 1 : 0);
      data = data << 1;
    }
    data = data >> 1;

    if (this.waitingForData) {
      return [this.higherBits, data];
    }

    this.higherBits = data;
    this.waitingForData = true;
    return [-1, -1];
  }

  isWaitingForMoreData() {
    return this.waitingForData;
  }

  writeData: () => void;

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
    this.waitingForData = false;
  }
}

/**
 * 8-bit state
 */
export class EightBitState implements BitState {
  lcd: LCD16X2;

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

  isWaitingForMoreData() {
    return false;
  }

  writeData: () => void;

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }
}

/**
 * Data display interface
 */
export interface DataDisplayState {
  displayData: () => void;
  generateCharacterPanels: () => void;
  getFontSize: () => FontSize;
}

/**
 * Font8x5 display class
 */
export class Font8x5DisplayState implements DataDisplayState {
  characterPanels: any = {};

  lcd: LCD16X2;

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }

  getFontSize() {
    return FontSize._8x5;
  }

  displayData() {

  }

  generateCharacterPanels() {

  }
}

/**
 * Font10x5 display class
 */
export class Font10x5DisplayState implements DataDisplayState {
  characterPanels: any = {};

  lcd: LCD16X2;

  constructor(lcd: LCD16X2) {
    this.lcd = lcd;
  }

  getFontSize() {
    return FontSize._10x5;
  }

  displayData() {

  }

  generateCharacterPanels() {

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

    const characterPanel = this.lcd.getCharacterPanel(this.lcd.cursorPosition);
    const characterDisplayBytes = this.lcd.cgRom.readROM(higherBits, lowerBits);

    const characterBits = (higherBits << 4) | lowerBits;
    this.lcd.ddRam.writeToRAM(this.lcd.cursorPosition, characterBits);
    characterPanel.drawCharacter(characterDisplayBytes);

    if (this.lcd.autoCursorShift) {
      this.lcd.moveCursorRight();
      if (this.lcd.autoDisplayShift) {
        this.lcd.scrollDisplayRight();
      }
    } else {
      this.lcd.moveCursorLeft();
      if (this.lcd.autoDisplayShift) {
        this.lcd.scrollDisplayLeft();
      }
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

  clearDisplay(data) {
    this.lcd.clearDisplay();
  }

  setCursorHome(data) {
    this.lcd.cursorPosition = [0, 0];
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
    this.lcd.isDisplayOn = !this.lcd.isDisplayOn;
  }

  shiftCursorAndDisplay(data) {
      // TODO: display shift
      // data: [0   0   0   1  S/C R/L  *   * ]
      const rSlashL = (data >> 2) & 1;
      const sSlashC = (data >> 3) & 1;

      if (!(rSlashL & 1)) {
        this.lcd.moveCursorLeft();
        if (sSlashC & 1) {
          this.lcd.scrollDisplayLeft();
        }
      } else if (rSlashL & 1) {
        this.lcd.moveCursorRight();
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
  }

  setCGRAMAddress(data) {

  }

  setDDRAMAddress(data) {
     
  }

  processData() {
    const [higherBits, lowerBits] = this.lcd.bitState.readData();
    const waitingForData = this.lcd.bitState.isWaitingForMoreData();
    if (waitingForData) {
      return;
    }
    console.log('higher, lower bits:', higherBits.toString(2), lowerBits.toString(2));

    const data = (higherBits << 4) | lowerBits;
    const instructionType = InstructionRegisterState.getInstructionType(data);

    console.log('received instruction type: ', InstructionType[instructionType], data.toString(2));

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
