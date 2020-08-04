import _ from 'lodash-transpose';
import { LCDUtils, FontSize } from './LCDUtils';

// https://www.8051projects.net/lcd-interfacing/basics.php

/**
 * DDRAM
 */
export class DDRAM {
    memory: any[][];
    N_ROW: number;
    N_COLUMN: number;
    pointer: [number, number];

    constructor(N_ROW: number, N_COLUMN: number) {
        this.memory = _.times(N_ROW, () => _.times(N_COLUMN, _.constant(0x00)));
        this.N_ROW = N_ROW;
        this.N_COLUMN = N_COLUMN;
    }

    static createDDRAMForLCD(N_ROW) {
        if (N_ROW === 1) {
            return new DDRAM(1, 40);
        } else if (N_ROW === 2) {
            return new DDRAM(2, 40);
        } else if (N_ROW === 4) {
            return new DDRAM(4, 20);
        }
    }

    validateIndex(index: [number, number]) {
        if (index[0] >= this.N_ROW || index[0] < 0) {
            throw Error('Invalid index.');
        }
        if (index[1] >= this.N_COLUMN || index[1] < 0) {
            throw Error('Invalid index.');
        }
    }

    readRAM(index: [number, number]) {
        this.validateIndex(index);
        return this.memory[index[0]][index[1]];
    }

    writeToRAM(index: [number, number], data: number) {
        this.validateIndex(index);
        this.memory[index[0]][index[1]] = data;
    }
}


/**
 * CGROM
 */
export class CGROM {
    memory: any[][];
    fontSize: [number, number];
    N_ROW = 16;
    N_COLUMN = 16;

    constructor(fontSize: FontSize) {
        // fontSize: [8, 5] or [10, 5]
        // TODO: implement 10x5
        this.memory = [[]];
        for (let character = 0; character < 0xFF; character++) {
          const higherBits = (character >> 4) & 0b1111;
          const lowerBits = (character) & 0b1111;
          this.memory[higherBits] = this.memory[higherBits] || [];
          this.memory[higherBits][lowerBits] = LCDUtils.getDisplayBytes(character);
        }
    }

    readROM(higherBit: number, lowerBit: number) {
        return this.memory[higherBit][lowerBit];
    }
}

