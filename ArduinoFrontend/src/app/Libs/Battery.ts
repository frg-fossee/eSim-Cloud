import { CircuitElement } from './CircuitElement';

/**
 * Battery9V class
 */
export class Battery9v extends CircuitElement {
  /**
   * Battery9V constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('Battery9v', x, y, 'Battery9v.json', canvas);
  }
  /** init is called when the component is complety drawn to the canvas */
  init() {
    // console.log(this.nodes[0].label);
    // console.log(this.nodes[1].label);
    this.nodes[1].addValueListener((v, calledby) => {
      // if both the terminals of battery are connected with each other
      if (calledby.parent.id === this.id) {
        /// TODO: Show Toast and Stop Simulation
        console.log('Short Circuit');
        window['showToast']('Short Circuit');
      }
      if (v >= 0 && this.nodes[0].value <= 0) {
        this.nodes[0].setValue(9, this.nodes[0]);
      }
      if (v < 0) {
        this.nodes[0].setValue(-1, this.nodes[0]);
      }
    });
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
      keyName: 'Battery9v',
      id: this.id,
      body,
      title: '9v Battery'
    };
  }
  /**
   * Initialize variable when start simulation is pressed
   */
  initSimulation(): void {
    this.nodes[0].setValue(9, null);
    setTimeout(() => {
      if (this.nodes[1].value < 0) {
        this.nodes[0].setValue(-1, null);
      }
    }, 10);
  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
  }
}

/**
 * CoinCell3V class
 */
export class CoinCell extends CircuitElement {
  /**
   * CoinCell 3V constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('CoinCell', x, y, 'CoinCell.json', canvas);
  }
  /**
   * Function provides component details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  init() {
    this.nodes[1].addValueListener((_, calledby, __) => {
      if (calledby.parent.id === this.id) {
        /// TODO: Show Toast and Stop Simulation
        window['showToast']('Short Circuit');
      }
    });
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
      title: 'Coin Cell'
    };
  }
  /**
   * Initialize variable when start simulation is pressed
   */
  initSimulation(): void {
    this.nodes[0].setValue(3, null);
  }
  /**
   * Called on stop Simulation
   */
  closeSimulation(): void {
  }
}
