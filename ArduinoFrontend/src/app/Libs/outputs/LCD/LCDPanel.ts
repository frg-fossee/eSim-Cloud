import { LCDUtils } from './LCDUtils';
import { MathUtils } from '../../Utils';

export class LCDPixel {
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

  canvas: any;

  changesPending: boolean;

  lcdX: number;

  lcdY: number;

  hidden: boolean;

  blinkHidden = false;

  constructor(parentIndex: [number, number], index: [number, number], posX: number,
              posY: number, lcdX: number, lcdY: number, width: number, height: number, dimColor: string, glowColor: string) {
    this.parentIndex = parentIndex;
    this.index = index;
    this.posX = posX;
    this.posY = posY;
    this.lcdX = lcdX;
    this.lcdY = lcdY;
    this.width = width;
    this.height = height;
    this.dimColor = dimColor;
    this.glowColor = glowColor;
    this.isOn = false;
    this.brightness = 100;
    this.canvas = null;
    this.changesPending = false;
    this.hidden = false;
  }

  /**
   * @param distance distance by which to shift horizontally
   * @param hidden new state of the pixel
   */
  shift(distance, hidden) {
    this.posX += distance;
    this.canvas.attr({
      x: this.posX + this.lcdX
    });
    // if the state changes
    if (this.hidden !== hidden) {
      if (hidden) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  switch(value) {
    const prevValue = this.isOn;
    this.isOn = parseInt(value, 2) && true;
    if (prevValue !== this.isOn) {
      this.changesPending = true;
    }
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

  show() {
    this.hidden = false;
    this.canvas.show();
  }

  hide() {
    this.hidden = true;
    this.canvas.hide();
  }

  blinkOn() {
    this.blinkHidden = true;
    this.canvas.attr({
      fill: '#000'
    });
  }

  blinkOff() {
    this.blinkHidden = false;
    this.canvas.attr({
      fill: this.getColor()
    });
  }

  refresh() {
    if (this.changesPending) {
      this.canvas.attr({
        x: this.posX + this.lcdX,
        y: this.posY + this.lcdY,
        fill: this.getColor(),
      });
      this.changesPending = false;
    }
  }
}


export class LCDCharacterPanel {

    N_ROW: number;

    N_COLUMN: number;

    index: [number, number];
    pixels: LCDPixel[][];
    posX: number;
    posY: number;
    lcdX: number;
    lcdY: number;
    pixelWidth: number;
    pixelHeight: number;
    barColor: string;
    barGlowColor: string;
    intraSpacing: number;
    lcdDisplayStartIndex: [number, number];
    lcdDisplayEndIndex: [number, number];
    displayIndex: [number, number];
    hidden: boolean;
    blinkFunction: any;

    shift(distance: number) {
        this.posX += distance;
        this.shiftPixels(distance);
    }

    private shiftPixels(distance: number) {
      for (let i = 0; i < this.N_ROW; i++) {
        for (let j = 0; j < this.N_COLUMN; j++) {
          this.pixels[i][j].shift(distance, this.hidden);
        }
      }
    }

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
            this.lcdX,
            this.lcdY,
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

    clear() {
      this.changeCursorDisplay(false);
      this.drawCharacter(LCDUtils.getBlankDisplayBytes());
      this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => pixel.refresh()));
      clearInterval(this.blinkFunction);
    }

    drawCharacter(characterDisplayBytes) {
      for (let i = 0; i < this.N_ROW - 1; i++) {
        for (let j = 0; j < this.N_COLUMN; j++) {
          this.pixels[i][j].switch(characterDisplayBytes[i][j]);
        }
      }
    }

    changeCursorDisplay(show: boolean) {
      for (let j = 0; j < this.N_COLUMN; j++) {
        this.pixels[this.N_ROW - 1][j].switch(show ? 1 : 0);
      }
      if (!show) {
        clearInterval(this.blinkFunction);
      }
    }

    private blink() {
      this.blinkFunction = setInterval(() => {
        this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => {
          if (pixel.blinkHidden) {
            pixel.blinkOff();
          } else {
            pixel.blinkOn();
          }
        }));
      }, 700);
    }

    setBlinking(value: boolean) {
      if (value) {
        this.blink();
      } else {
        clearInterval(this.blinkFunction);
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
                posX: number, posY: number, lcdX: number, lcdY: number,
                pixelWidth: number, pixelHeight: number, barColor: string,
                barGlowColor: string, intraSpacing: number, lcdDisplayStartIndex: [number, number],
                lcdDisplayEndIndex: [number, number], displayIndex: [number, number], hidden: boolean) {
      this.index = index;
      this.N_ROW = N_ROW;
      this.N_COLUMN = N_COLUMN;
      this.posX = posX;
      this.posY = posY;
      this.lcdX = lcdX;
      this.lcdY = lcdY;
      this.pixelHeight = pixelHeight;
      this.pixelWidth = pixelWidth;
      this.barColor = barColor;
      this.barGlowColor = barGlowColor;
      this.intraSpacing = intraSpacing;
      this.lcdDisplayStartIndex = lcdDisplayStartIndex;
      this.lcdDisplayEndIndex = lcdDisplayEndIndex;
      this.displayIndex = displayIndex;
      this.hidden = hidden;
      this.initialiseLCDPixels();
    }
  }
