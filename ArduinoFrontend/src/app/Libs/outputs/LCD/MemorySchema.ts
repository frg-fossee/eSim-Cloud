import _ from 'lodash-transpose';
import { LCDUtils, FontSize } from './LCDUtils';

// https://www.8051projects.net/lcd-interfacing/basics.php

export interface RAM {
    read(address: number): any;
    write(address: number, data: any): void;
}

/**
 * DDRAM
 */
export class DDRAM implements RAM {
    memory: any[];
    N_ROW: number;
    N_COLUMN: number;

    constructor(N_ROW: number, N_COLUMN: number) {
        this.memory = _.times(1 << 7, 0);
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

    convertIndexToAddress(index: [number, number]): number {
        if (this.N_ROW === 1) {
            return index[1];
        }
        if (this.N_ROW === 2) {
            const address = index[0] * 0x40 + index[1];
            return address;
        }
        // TODO: implement 4 rows
    }

    convertAddressToIndex(address: number): [number, number] {
        if (this.N_ROW === 1) {
            return [0, address];
        }
        if (this.N_ROW === 2) {
            return [Math.floor(address / 0x40), address % 0x40];
        }
        // TODO: implement 4 rows
    }

    validateIndex(address: number) {
        if (address < 0x00 || address >= 0x7F) {
            throw Error('Invalid index.');
        }
    }

    read(address: number): number {
        this.validateIndex(address);
        return this.memory[address];
    }

    readAtIndex(index: [number, number]): number {
        const address = this.convertIndexToAddress(index);
        return this.memory[address];
    }

    write(address: number, data: number) {
        this.validateIndex(address);
        this.memory[address] = data;
    }
}


/**
 * CGROM
 */
export class CGROM {

    memory: any[][];
    fontSize: FontSize;
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
          this.memory[higherBits][lowerBits] = LCDUtils.getDisplayBytes(character, fontSize);
        }
    }

    readROM(higherBit: number, lowerBit: number): number[][] {
        return this.memory[higherBit][lowerBit];
    }
}

/**
 * CGRAM class
 */
export class CGRAM implements RAM {
    memory: {[key: number]: number} = {};

    constructor() {}

    validateAddress(address) {
        if (address < 0x40 || address >= 0x80) {
            return false;
        }
        return true;
    }

    read(address: number): number[] {
        if (!this.validateAddress(address)) {
            console.log('Invalid address provided to CGRAM while reading.');
            return;
        }
        return LCDUtils.convertHexToBinaryArray(this.memory[address]);
    }

    write(address: number, data: number) {
        if (!this.validateAddress(address)) {
            console.log('Invalid address provided to CGRAM while writing.');
            return;
        }
        this.memory[address] = data;
    }
}
