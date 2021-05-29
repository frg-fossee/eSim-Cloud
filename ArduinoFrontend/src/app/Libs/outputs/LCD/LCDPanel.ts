import { LCDUtils } from './LCDUtils';
import chroma from 'chroma-js';
import LRU from 'lru-cache';
import { BoundingBox } from '../../Geometry';

const COLOR_SCALING_MAP = new LRU({
  max: 5000,
  length(n, key) { return n * 2 + key.length; },
  dispose(key, n) { n.close(); },
  maxAge: 1000 * 60 * 60
});

/**
 * LCDPixel: Class prototype for the pixels inside a LCD Character panel
 */
export class LCDPixel {
  /**
   * Index of the parent grid
   */
  parentIndex: [number, number];

  /**
   * Self-index inside the parent grid
   */
  index: [number, number];

  /**
   * x-coordinate of the pixel with respect to the lcd
   */
  posX: number;

  /**
   * y-coordinate of the pixel with respect to the lcd
   */
  posY: number;

  /**
   * width of the pixel
   */
  width: number;

  /**
   * height of the pixel
   */
  height: number;

  /**
   * color of the pixel when it is switched off
   */
  dimColor: string;

  /**
   * color of the pixel when it is switched on
   */
  glowColor: string;

  /**
   * switch status of the pixel: true when on, false when off
   */
  isOn: boolean;

  /**
   * brightness i.e., opacity of the pixel
   */
  brightness: number;

  /**
   * Raphael canvas component of the pixel
   */
  canvas: any;

  /**
   * Boolean flag to store if any changes are pending to be rendered.
   * Pending changes are rendered upon calling the `refresh` method.
   */
  changesPending: boolean;

  /**
   * x-coordinate of the lcd of which the pixel is a part of
   */
  lcdX: number;

  /**
   * y-coordinate of the lcd of which the pixel is a part of
   */
  lcdY: number;

  /**
   * Show/hide status of the pixel
   */
  hidden: boolean;

  /**
   * Blink status of the pixel
   * true when the pixel is hidden while blinking
   * false when the pixel is shown while blinking
   */
  blinkHidden = false;

  /**
   * Contrast of the pixel
   */
  contrast = 100;

  constructor(parentIndex: [number, number], index: [number, number], posX: number,
              posY: number, lcdX: number, lcdY: number, width: number, height: number,
              dimColor: string, glowColor: string) {
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
   * @param value color value
   */
  fillColor(color) {
    if (this.canvas) {
      this.canvas.attr({
        fill: color
      });
    }
  }

  setContrast(value) {
    const currentColor = this.getColor();
    this.contrast = value;
    const newColor = this.getColor();
    if (newColor !== currentColor) {
      this.fillColor(newColor);
    }
  }

  /**
   * @param distance distance by which to shift horizontally
   * @param hidden new state of the pixel
   */
  shift(distance, hidden) {
    this.posX += distance;

    // if canvas is not set yet, return
    if (!this.canvas) {
      return;
    }

    this.canvas.attr({
      x: this.posX + this.lcdX
    });

    // if the state changes, then take it in effect
    if (this.hidden !== hidden) {
      if (hidden) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  /**
   * Switch the pixel to on/off
   * @param value true to switch on, false to switch off
   */
  switch(value) {
    const prevValue = this.isOn;
    this.isOn = parseInt(value, 2) && true;
    if (prevValue !== this.isOn) {
      this.changesPending = true;
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.remove();
    }
  }

  /**
   * get the raw color of the pixel
   */
  getRawColor() {
    return this.isOn ? this.glowColor : this.dimColor;
  }

  /**
   * gets contrast-adjust color
   */
  getColor(rawColor?: string) {
    rawColor = rawColor || this.getRawColor();
    let newColorScale = COLOR_SCALING_MAP.get(rawColor);

    if (!newColorScale) {
      newColorScale = chroma.scale([this.dimColor, rawColor]);
      COLOR_SCALING_MAP.set(rawColor, newColorScale);
    }

    const newColor = newColorScale(this.contrast / 100).hex();
    return newColor;
  }

  /**
   * get the name of the pixel
   */
  getName() {
    return `G:${this.parentIndex[0]}:${this.parentIndex[1]}:${this.index[0]}:${this.index[1]}`;
  }

  /**
   * get the canvas representation of the pixel
   */
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

  /**
   * shows the pixel
   */
  show() {
    this.hidden = false;
    this.canvas.show();
  }

  /**
   * hides the pixel
   */
  hide() {
    this.hidden = true;
    this.canvas.hide();
  }

  /**
   * turn on blinking
   */
  blinkOn() {
    this.blinkHidden = true;
    this.canvas.attr({
      fill: this.getColor(this.glowColor)
    });
  }

  /**
   * turn off blinking
   */
  blinkOff() {
    if (this.blinkHidden && this.canvas) {
      this.canvas.attr({
        fill: this.getColor()
      });
      this.blinkHidden = false;
    }
  }

  /**
   * Refreshes the pixel if changes are pending, else does nothing
   */
  refresh() {
    if (this.changesPending && this.canvas) {
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
  /**
   * number of rows of children pixels
   */
  N_ROW: number;

  /**
   * number of columns of children pixels
   */
  N_COLUMN: number;

  /**
   * Position index of the character panel within the lcd
   */
  index: [number, number];

  /**
   * Array of the chldren pixels
   */
  pixels: LCDPixel[][];

  /**
   * x-coordinate of the character panel wrt to the lcd
   */
  posX: number;

  /**
   * y-coordinate of the character panel wrt to the lcd
   */
  posY: number;

  /**
   * x-coordinate of the lcd
   */
  lcdX: number;

  /**
   * y-coordinate of the lcd
   */
  lcdY: number;

  /**
   * width of the children pixels
   */
  pixelWidth: number;

  /**
   * height of the children pixels
   */
  pixelHeight: number;

  /**
   * color of the children pixels when they're turned off
   */
  barColor: string;

  /**
   * color of the children pixels when they're turned on
   */
  barGlowColor: string;

  /**
   * Horizontal/vertical spacing between the adjacent children pixels
   */
  intraSpacing: number;

  /**
   * Display index of the character panel on the lcd
   */
  displayIndex: [number, number];

  /**
   * Is the character panel out of view on the lcd
   */
  hidden: boolean;

  /**
   * variable to store the interval function during the blinking
   */
  blinkFunction: any;

  /**
   * does the panel contain the cursor?
   */
  containsCursor: boolean;

  /**
   * contrast of the lcd
   */
  contrast = 100;

  /**
   * Constructor
   * @param index index of the character panel
   * @param N_ROW number of rows of pixels
   * @param N_COLUMN number of columns of pixels
   * @param posX x-coordinate of the character panel wrt to the lcd
   * @param posY y-coordinate of the character panel wrt to the lcd
   * @param lcdX x-coordinate of the lcd
   * @param lcdY y-coordinate of the lcd
   * @param pixelWidth width of the child pixel
   * @param pixelHeight height of the child pixel
   * @param barColor color of the children pixels when they're off
   * @param barGlowColor color of the children pixels when they're on
   * @param intraSpacing Horizontal/vertical space between each adjacent pixel
   * @param displayIndex Display index of the character panel
   * @param hidden Is the character panel hidden?
   * @param contrast contrast of the lcd
   */
  constructor(index: [number, number], N_ROW: number, N_COLUMN: number,
              posX: number, posY: number, lcdX: number, lcdY: number,
              pixelWidth: number, pixelHeight: number, barColor: string,
              barGlowColor: string, intraSpacing: number,
              displayIndex: [number, number], hidden: boolean, contrast: number) {
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
    this.displayIndex = displayIndex;
    this.hidden = hidden;
    this.contrast = contrast;
    this.initialiseLCDPixels();
  }

  /**
   * changes the contrast of the character panel
   * @param value contrast value between 0 and 100
   */
  setContrast(value) {
    this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => {
      pixel.setContrast(value);
    }));
  }

  /**
   * Shifts the panel by distance `distance`
   * @param distance distance by which to move the panel
   */
  shift(distance: number) {
      this.posX += distance;
      this.shiftPixels(distance);
  }

  getBoundingBox(): BoundingBox {
    const width = (this.pixelWidth + this.intraSpacing) * this.N_ROW - this.intraSpacing;
    const height = (this.pixelHeight + this.intraSpacing) * this.N_COLUMN - this.intraSpacing;
    return new BoundingBox(this.posX, this.posY, width, height);
  }

  /**
   * Shift the children pixels by distance `distance`
   * @param distance distance by which to move the children pixels
   */
  private shiftPixels(distance: number) {
    for (let i = 0; i < this.N_ROW; i++) {
      for (let j = 0; j < this.N_COLUMN; j++) {
        this.pixels[i][j].shift(distance, this.hidden);
      }
    }
  }

  /**
   * Destroys the canvas of all the pixels inside the panel
   */
  destroy() {
    this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => pixel.destroy()));
  }

  /**
   * Initialises all the contained pixels
   */
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

  /**
   * Clears the panel by turning off all the pixels
   */
  clear() {
    this.changeCursorDisplay(false);
    this.drawCharacter(LCDUtils.getBlankDisplayBytes());
    this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => pixel.refresh()));
    clearInterval(this.blinkFunction);
  }

  /**
   * Prints the bytes on the character panel
   * @param characterDisplayBytes array of bytes to display on the panel
   */
  drawCharacter(characterDisplayBytes: number[][]) {
    let byte = null;
    for (let i = 0; i < this.N_ROW - 1; i++) {
      for (let j = 0; j < this.N_COLUMN; j++) {
        try {
          byte = characterDisplayBytes[i][j];
        } catch (e) {
          // if byte is absent for some reason, switch the pixel off
          byte = 0;
        }
        this.pixels[i][j].switch(byte);
      }
    }
  }

  /**
   * Adds/remove the cursor display on the panel
   * @param show true to add the cursor, false to remove it
   */
  changeCursorDisplay(show: boolean) {
    if (this.containsCursor === show) {
      return;
    }
    for (let j = 0; j < this.N_COLUMN; j++) {
      this.pixels[this.N_ROW - 1][j].switch(show ? 1 : 0);
    }
    if (!show) {
      clearInterval(this.blinkFunction);
    }
    this.containsCursor = show;
  }

  /**
   * Starts blinking the panel
   */
  private blink() {
    this.blinkFunction = setInterval(() => {
      this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => {
        if (pixel.blinkHidden) {
          pixel.blinkOff();
        } else {
          pixel.blinkOn();
        }
      }));
    }, 600);
  }

  /**
   * Turns on/off blinking on the panel
   * @param value true to turn on, false to turn off
   */
  setBlinking(value: boolean) {
    if (value) {
      this.blink();
    } else if (this.blinkFunction) {
        clearInterval(this.blinkFunction);
        this.blinkFunction = null;
        this.pixels.forEach(pixelRow => pixelRow.forEach(pixel => pixel.blinkOff()));
      }
  }

  /**
   * Returns the Rafael canvas representation of the panel
   */
  getCanvasRepr(): any[] {
    const canvasGrid = [];
    for (const rowPixels of this.pixels) {
      for (const pixel of rowPixels) {
        canvasGrid.push(pixel.getCanvasRepr());
      }
    }
    return canvasGrid;
  }
}
