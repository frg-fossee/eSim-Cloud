import { CircuitElement } from '../CircuitElement';

/**
 * LCD16X2 Class
 */
export class LCD16X2 extends CircuitElement {
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

  init() {

    /**
     * Draws lcd grid (16x2) each containing a block of 8 rows x 5 columns
     */
    const grid: any = [];
    let i: number;
    let j: number;
    let k: number;
    let l: number;
    let tempX: number;
    let tempY: number;
    let tempRowsX: number;
    let tempColumnsY: number;
    let posX = this.data.startX;
    let posY = this.data.startY;
    for (k = 0; k < this.data.rows; k++) { // Rows: 2
      tempX = posX;
      tempY = posY;
      for (l = 0; l < this.data.columns; l++) { // Columns: 16 (Characters)
        tempColumnsY = posY;
        for (i = 0; i < this.data.gridRows; i++) { // Rows: 8
          tempRowsX = posX;
          for (j = 0; j < this.data.gridColumns; j++) { // Columns: 5 (Characters)
            const temp = {
              name: 'G' + k + l + i + j,
              type: 'rectangle',
              width: this.data.gridWidth,
              height: this.data.gridHeight,
              x: posX,
              y: posY,
              fill: this.data.barColor,
            };
            grid.push(temp);
            posX = posX + this.data.gridWidth + this.data.intraSpacing;
          } // Col ends
          posX = tempRowsX;
          posY = posY + this.data.gridHeight +  this.data.intraSpacing;
        }
        posX = posX + (this.data.gridColumns * this.data.gridWidth) + this.data.interSpacing;
        posY = tempColumnsY;
      }
      posY = tempY + (this.data.gridRows * this.data.gridWidth) + (this.data.interSpacing * 1.5);
      posX = tempX;
    } // Row ends
    this.DrawElement(this.canvas, grid);

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
