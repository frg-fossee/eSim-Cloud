import { Point } from './Point';

/**
 * Abstract Class Circuit Elements
 * Inherited by Each Circuit Component
 */
export abstract class CircuitElement {
  public keyName: string; // Circuit Component Name
  public id: number; // Stores the id of the Component
  public nodes: Point[] = []; // Stores the Nodes of a Component
  public elements: any;
  public tx = 0;
  public ty = 0;

  /**
   * Creates Circuit Component
   * @param keyName Circuit Component Name
   */
  constructor(keyName: string, public x: number, public y: number) {
    this.id = Date.now(); // Generate New id
    this.keyName = keyName; // Set key name
    this.elements = window['canvas'].set();
  }

  setDragListeners() {
    let tmpx = 0;
    let tmpy = 0;
    let fdx = 0;
    let fdy = 0;
    let tmpar = [];
    this.elements.drag((dx, dy) => {
      this.elements.transform(`t${this.tx + dx},${this.ty + dy}`);
      tmpx = this.tx + dx;
      tmpy = this.ty + dy;
      fdx = dx;
      fdy = dy;
      for (let i = 0; i < this.nodes.length; ++i) {
        this.nodes[i].move(tmpar[i][0] + dx, tmpar[i][1] + dy);
      }
    }, () => {
      fdx = 0;
      fdy = 0;
      tmpar = [];
      for (const node of this.nodes) {
        // node.remainHidden();
        tmpar.push(
          [node.x, node.y]
        );
      }
    }, () => {
      // for (const node of this.nodes) {
      //   node.relativeMove(fdx, fdy);
      //   node.remainShow();
      // }
      this.tx = tmpx;
      this.ty = tmpy;
    });
  }

  setHoverListener() {
    // this.elements.mouseover(() => {
    //   for (const node of this.nodes) {
    //     // node.show();
    //   }
    // });
    // this.elements.mouseout(() => {
    //   for (const node of this.nodes) {
    //     // node.hide();
    //   }
    // });
  }

  setClickListener(callback: () => void) {
    this.elements.click(() => {
      window['isSelected'] = true;
      window['Selected'] = this;
      window['showProperty'](() => this.properties());
      if (callback) {
        callback();
      }
    });
  }
  /**
   * Save Circuit Component
   */
  abstract save(): any;
  /**
   * Load Circuit Component
   */
  abstract load(data: any): void;
  /**
   * Returns the Circuit Node based on the x,y Position
   */
  abstract getNode(x: number, y: number): Point;
  /**
   * Removes Component from Canvas and memory
   */
  remove(): void {
    this.elements.remove();
    for (const n of this.nodes) {
      n.remove();
    }
  }
  /**
   * Return the Property of the Circuit Component
   * @returns Object containing component name,id and the html required to be shown on property box
   */
  abstract properties(): { keyName: string, id: number, body: HTMLElement, title: string };
  /**
   * Initialize variable required for simulation
   * Called before simulation
   */
  abstract initSimulation(): void;
  /**
   * Called when Stop Simulation
   */
  abstract closeSimulation(): void;
  /**
   * Called During Simulation
   */
  abstract simulate(): void;
}
