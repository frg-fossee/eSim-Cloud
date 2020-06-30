import { CircuitElement } from '../CircuitElement';

/**
 * Relay Module Class
 */
export class Relay extends CircuitElement {
  /**
   * Relay Constructor
   * @param canvas Raphael canvas
   * @param x Position x
   * @param y Position y
   */
  constructor(public canvas: any, public x: number, y: number) {
    super('RelayModule', x, y, 'Relay.json', canvas);
  }
  /**
   * Initialize the relay module.
   */
  init() {
    let iniValue = 0;
    this.nodes[4].addValueListener((v) => {
      this.nodes[5].setValue(v, null);
    });
    this.nodes[3].addValueListener((val) => {
      if (val > 4.9 && val < 5.1) {
        if (this.nodes[1].value > 0) {
          iniValue = 2;
          this.nodes[2].setValue(this.nodes[1].value, null);
        } else if (this.nodes[2].value > 0) {
          iniValue = 1;
          this.nodes[1].setValue(this.nodes[2].value, null);
        }
      } else {
        this.nodes[iniValue].setValue(-1, this.nodes[iniValue]);
      }
    });
  }
  /**
   * Function provides component details
   * @param keyName  Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Relay Module',
      body
    };
  }
  /**
   * Check connection,if not connected show toast.
   */
  initSimulation(): void {
    // Check Connection
    if (
      !(this.nodes[1].connectedTo &&
        this.nodes[2].connectedTo &&
        this.nodes[3].connectedTo &&
        this.nodes[4].connectedTo &&
        this.nodes[5].connectedTo)
    ) {
      window['showToast']('Please Connect Relay Properly');
    }
  }
  /**
   * Called on Stop Simulation.
   */
  closeSimulation(): void {
  }
}
