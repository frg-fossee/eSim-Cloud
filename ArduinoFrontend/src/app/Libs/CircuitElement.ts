import { Point } from './Point';

/**
 * Abstract Class Circuit Elements
 * Inherited by Each Circuit Component
 */
export abstract class CircuitElement {
  public keyName: string; // Circuit Component Name
  public id: number; // Stores the id of the Component
  public nodes: Point[] = []; // Stores the Nodes of a Component

  /**
   * Creates Circuit Component
   * @param keyName Circuit Component Name
   */
  constructor(keyName: string) {
    this.id = Date.now(); // Generate New id
    this.keyName = keyName; // Set key name
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
  abstract remove(): void;
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
